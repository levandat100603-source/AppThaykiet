import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Platform,
  RefreshControl,
  Image,
  KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { useAuth } from '../../src/api/context/AuthContext';
import { UI, getThemeColors } from '../../src/ui/design';
import Reveal from '../../components/ui/Reveal';
import { useThemeMode } from '../../src/ui/theme-mode';

const API_ORIGIN = (() => {
    const baseURL = api.defaults.baseURL;
    if (!baseURL) return null;
    try {
        return new URL(baseURL).origin;
    } catch {
        return null;
    }
})();

// --- HÀM HỖ TRỢ XỬ LÝ ẢNH (FIX LỖI HIỂN THỊ & CACHE) ---
const getSmartImageUrl = (url: string | null) => {
  if (!url) return undefined;

  let finalUrl = url;

    // 1. Nếu là đường dẫn tương đối (VD: /storage/img.jpg) -> Gắn origin từ API hiện tại
    if (finalUrl.startsWith('/') && API_ORIGIN) {
        finalUrl = `${API_ORIGIN}${finalUrl}`;
  }

    // 2. Chuẩn hóa URL cũ dùng localhost/127.0.0.1 sang origin API hiện tại
    if ((finalUrl.includes('localhost') || finalUrl.includes('127.0.0.1')) && API_ORIGIN) {
        try {
            const parsed = new URL(finalUrl);
            finalUrl = `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
        } catch {
            // noop: giữ nguyên finalUrl nếu parse thất bại
        }
  }

  // 3. Thêm timestamp để ép tải lại ảnh mới (Cache busting)
  const timestamp = new Date().getTime();
  return `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
};

const COLOR_OPTIONS = [
  { label: 'Xanh dương', value: 'blue', code: '#3b82f6' },
  { label: 'Xanh lá', value: 'green', code: '#22c55e' },
  { label: 'Tím', value: 'purple', code: '#a855f7' },
  { label: 'Vàng', value: 'amber', code: '#f59e0b' },
];

const showAlert = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}: ${msg}`);
    } else {
        Alert.alert(title, msg);
    }
};

const parseDate = (dateStr: string) => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};

const formatDate = (date: Date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const isPastDate = (dateStr: string) => {
  const inputDate = parseDate(dateStr);
  if (!inputDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate.getTime() < today.getTime();
};

const addMonths = (dateStr: string, months: number) => {
  const date = parseDate(dateStr);
  if (!date || isNaN(date.getTime())) return '';
  date.setMonth(date.getMonth() + months);
  return formatDate(date);
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isFutureDate = (dateStr: string) => {
  const inputDate = parseDate(dateStr);
  if (!inputDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate.getTime() > today.getTime();
};

const formatDateFromDateObject = (date: Date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

const displayDateToIso = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const isoDateToDisplay = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

export default function AdminDashboard() {
        const { motionMode, isDark } = useThemeMode();
    const { token, isInitializing, user } = useAuth();
    const { tab } = useLocalSearchParams<{ tab?: string }>();
    const colors = getThemeColors(isDark);
  const [activeTab, setActiveTab] = useState('classes');
    const [expandedTrainerId, setExpandedTrainerId] = useState<number | null>(null);
    useEffect(() => {
                const allowedTabs = ['classes', 'trainers', 'packages', 'members', 'bookings', 'trainer-schedules'];
        const requestedTab = Array.isArray(tab) ? tab[0] : tab;
        if (requestedTab && allowedTabs.includes(requestedTab)) {
            setActiveTab(requestedTab);
        }
    }, [tab]);

  
  const [classes, setClasses] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
    const [trainerSchedules, setTrainerSchedules] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [memberFormMode, setMemberFormMode] = useState<'manual' | 'pick'>('manual');
  const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateForClass, setSelectedDateForClass] = useState<Date>(new Date());
    const webClassDateInputRef = React.useRef<HTMLInputElement | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', price: '', 
        image_url: '', spec: '', exp: '', rating: '',
    trainerName: '', location: '', duration: '', days: '', capacity: '', registered: '',
    timeHour: '06', timeMinute: '00', timeMode: 'AM',
    oldPrice: '', color: 'blue', benefitsText: '', isPopular: false,
    email: '', phone: '', pack: '', start: '', end: '', status: 'active',
    benefits: '',
    removeImage: false,
  });

  const formatMoney = (num: number) => num.toLocaleString('vi-VN') + 'đ';

    const statusPalette = (active: boolean) =>
        active
            ? (isDark ? { bg: '#14532d', fg: '#4ade80' } : { bg: '#dcfce7', fg: '#166534' })
            : (isDark ? { bg: '#334155', fg: '#cbd5e1' } : { bg: '#f1f5f9', fg: '#64748b' });

  const fetchData = useCallback(async () => {
        if (isInitializing || !token || user?.role !== 'admin') {
            setLoading(false);
            setRefreshing(false);
            return;
        }

    try {
        setLoading(true);
        const res = await api.get('/admin/data');
        if (res.data) {
            setClasses(res.data.classes || []);
            setTrainers(res.data.trainers || []);
            setPackages(res.data.packages || []);
            setMembers(res.data.members || []);
            setTrainerSchedules(res.data.trainer_schedules || []);
            setAvailableUsers(res.data.available_users || []);
        }
        const bookingsRes = await api.get('/admin/bookings');
        setBookings(bookingsRes.data || []);
    } catch (error) {
        console.log('Lỗi tải dữ liệu:', error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
    }, [isInitializing, token, user?.role]);

  const pickImage = async () => {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            if (Platform.OS === 'web' && uri.startsWith('blob:')) {
              try {
                const response = await fetch(uri);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                  setFormData({...formData, image_url: reader.result as string, removeImage: false});
                };
                reader.readAsDataURL(blob);
              } catch (e) {
                console.log('Error converting blob:', e);
                setFormData({...formData, image_url: uri, removeImage: false});
              }
            } else {
              setFormData({...formData, image_url: uri, removeImage: false});
            }
        }
    } catch {
        Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  useEffect(() => {
        if (!isInitializing && token && user?.role === 'admin') {
            fetchData();
        }
    }, [fetchData, isInitializing, token, user?.role]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  useEffect(() => {
    if (packages.length > 0 && !formData.pack) {
      setFormData(prev => ({ ...prev, pack: packages[0].name }));
    }
    }, [packages, formData.pack]);

  useEffect(() => {
    if (activeTab === 'members' && formData.start && formData.start.length >= 8 && formData.pack) {
       const selectedPack = packages.find(p => p.name === formData.pack);
       if (selectedPack) {
         const monthsStr = selectedPack.duration.match(/\d+/);
         const monthsToAdd = monthsStr ? parseInt(monthsStr[0]) : 1;
         const newEndDate = addMonths(formData.start, monthsToAdd);
         setFormData(prev => ({ ...prev, end: newEndDate, duration: monthsToAdd + ' tháng' }));
       }
    }
  }, [formData.start, formData.pack, activeTab, packages]);

  // --- HÀM SAVE ĐÃ FIX LỖI UPLOAD ANDROID ---
  const handleSave = async () => {
    console.log('--- Bắt đầu Lưu ---');

    if (!formData.name) return showAlert('Thiếu thông tin', 'Vui lòng nhập tên!');
    if (activeTab === 'classes' && !formData.duration) return showAlert('Thiếu thông tin', 'Vui lòng nhập thời lượng!');
    if (activeTab === 'classes' && !formData.days) return showAlert('Thiếu thông tin', 'Vui lòng chọn ngày tập!');
    if (activeTab === 'classes' && !formData.trainerName) return showAlert('Thiếu thông tin', 'Vui lòng chọn huấn luyện viên!');

    // Validate that all class dates are in the future
    if (activeTab === 'classes') {
        const dates = formData.days.split(',').map(d => d.trim());
        for (const dateStr of dates) {
            if (!isFutureDate(dateStr)) {
                return showAlert('Lỗi', `Ngày ${dateStr} không phải là ngày trong tương lai!`);
            }
        }
    }

    if (activeTab === 'members') {
        if (!isValidEmail(formData.email)) return showAlert('Lỗi', 'Email không đúng định dạng!');
        if (isPastDate(formData.start)) return showAlert('Lỗi', 'Ngày bắt đầu không thể chọn trong quá khứ!');
    }
    
    if (activeTab === 'trainers') {
        if (!formData.email) return showAlert('Thiếu thông tin', 'Vui lòng nhập email!');
        if (!isValidEmail(formData.email)) return showAlert('Lỗi', 'Email không đúng định dạng!');
    }

    const cleanDuration = formData.duration ? parseInt(formData.duration.toString().replace(/[^0-9]/g, '')) : 0;
    const cleanPrice = formData.price ? Number(formData.price.toString().replace(/[^0-9]/g, '')) : 0;
    const combinedTime = `${formData.timeHour}:${formData.timeMinute} ${formData.timeMode}`;
    const benefitsCount = formData.benefitsText ? formData.benefitsText.split('\n').filter(line => line.trim() !== '').length : 0;

    const payload = {
        type: activeTab,
        id: editingItem ? editingItem.id : null,
        name: formData.name,
        price: cleanPrice,
        ...(activeTab === 'classes' ? { 
            trainer_name: formData.trainerName, time: combinedTime, duration: cleanDuration,
            days: formData.days, location: formData.location, 
            capacity: formData.capacity ? Number(formData.capacity) : 0, 
            registered: formData.registered ? Number(formData.registered) : 0
        } : {}),
        ...(activeTab === 'trainers' ? { 
            email: formData.email,
            image_url: formData.image_url, 
            spec: formData.spec, exp: formData.exp, rating: formData.rating, 
            remove_image: formData.removeImage ? 1 : 0,
        } : {}),
        ...(activeTab === 'packages' ? { 
            duration: cleanDuration, price: cleanPrice, old_price: formData.oldPrice ? Number(formData.oldPrice.toString().replace(/[^0-9]/g, '')) : null,
            color: formData.color, is_popular: formData.isPopular ? 1 : 0, 
            benefits: benefitsCount, benefits_text: formData.benefitsText, status: formData.status
        } : {}),
        ...(activeTab === 'members' ? { 
            email: formData.email, phone: formData.phone || '', pack: formData.pack, 
            duration: cleanDuration, start: formData.start, end: formData.end, status: formData.status
        } : {}),
    };

    try {
        setLoading(true);

        const isNewImage = formData.image_url && 
                           !formData.image_url.startsWith('http://') && 
                           !formData.image_url.startsWith('https://');

        let response;
        if (activeTab === 'trainers' && isNewImage) {
            console.log('--- Uploading New Image ---');
            const formDataMultipart = new FormData();
            
            Object.keys(payload).forEach(key => {
                if (key !== 'image_url') {
                    formDataMultipart.append(key, payload[key as keyof typeof payload] as any);
                }
            });

            if (Platform.OS === 'web') {
                 try {
                    const res = await fetch(formData.image_url);
                    const blob = await res.blob();
                    formDataMultipart.append('image', blob as any, 'trainer-image.jpg');
                } catch (e) { console.log('Err Blob Web:', e); }
            } else {
                // --- XỬ LÝ ANDROID UPLOAD ---
                const localUri = formData.image_url;
                const filename = localUri.split('/').pop() || 'upload.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formDataMultipart.append('image', {
                    uri: localUri,
                    name: filename,
                    type: type, // QUAN TRỌNG: Server cần đúng mime type (png/jpg)
                } as any);
            }

            response = await api.post('/admin/store', formDataMultipart, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } else {
            console.log('--- Sending JSON ---');
            response = await api.post('/admin/store', payload);
        }
        
        if (response.data) {
            showAlert('Thành công', editingItem ? 'Đã cập nhật dữ liệu.' : 'Đã thêm mới thành công.');
            setModalVisible(false);
            await fetchData(); // Load lại data mới
        }
    } catch (error: any) {
        console.log('Lỗi API:', error);
        const msg = error.response?.data?.message || 'Lỗi kết nối Server';
        showAlert('Lỗi Server', msg);
    } finally {
        setLoading(false);
    }
  };

  const openModal = (item: any = null) => {
    setEditingItem(item);
    setSelectedUserId(null);
    setUserSearch('');
    setMemberFormMode(item ? 'manual' : 'manual');
    const todayStr = formatDate(new Date());

    let h = '06', m = '00', mode = 'AM';
    if (item && item.time) {
        if (item.time.includes('M')) {
            const [timePart, modePart] = item.time.split(' ');
            if(timePart && modePart) {
                const [hp, mp] = timePart.split(':');
                h = hp; m = mp; mode = modePart;
            }
        } else {
            const [hp, mp] = item.time.split(':');
            let hourNum = parseInt(hp);
            mode = hourNum >= 12 ? 'PM' : 'AM';
            if (hourNum > 12) hourNum -= 12;
            if (hourNum === 0) hourNum = 12;
            h = hourNum.toString().padStart(2, '0');
            m = mp;
        }
    }

    if (item) {
        setFormData({
            name: item.name, 
            price: item.price ? item.price.toString() : '',
            timeHour: h, timeMinute: m, timeMode: mode,
            trainerName: item.trainer_name || item.trainerName || '', 
            location: item.location || '', 
            duration: item.duration ? item.duration.toString() : '', 
            days: item.days || '', 
            capacity: item.capacity ? item.capacity.toString() : '', 
            registered: item.registered ? item.registered.toString() : '',
            image_url: item.image_url || '', 
            spec: item.spec || '', 
            exp: item.exp || '',
            rating: item.rating ? item.rating.toString() : '', 
            removeImage: false,
            oldPrice: (item.old_price || item.oldPrice) ? (item.old_price || item.oldPrice).toString() : '', 
            color: item.color || 'blue', 
            benefitsText: (item.benefits_text || item.benefitsText) || '', 
            isPopular: (item.is_popular === 1 || item.isPopular === true),
            email: item.email || '', 
            phone: item.phone || '', 
            pack: item.pack || (packages.length > 0 ? packages[0].name : ''), 
            start: item.start || todayStr, 
            end: item.end || '', 
            status: item.status || 'active',
            benefits: item.benefits ? item.benefits.toString() : ''
        });
    } else {
        setFormData({ 
            name: '', price: '', image_url: '', spec: '', exp: '', rating: '',
            trainerName: '', location: '', duration: '', days: '', capacity: '', registered: '',
            timeHour: '06', timeMinute: '00', timeMode: 'AM',
            oldPrice: '', color: 'blue', benefitsText: '', isPopular: false,
            email: '', phone: '', pack: packages.length > 0 ? packages[0].name : '', start: todayStr, end: '', status: 'active', benefits: '', removeImage: false
        });
    }
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    const confirmDelete = async () => {
          try {
              setLoading(true);
              const res = await api.post('/admin/delete', { type: activeTab, id: id });
              if (res.data?.success) {
                  fetchData();
              } else {
                  const msg = res.data?.message || 'Không thể xóa mục này';
                  showAlert('Lỗi', msg);
              }
          } catch (error: any) {
              const msg = error?.response?.data?.message || 'Không thể xóa mục này';
              showAlert('Lỗi', msg);
          } finally {
              setLoading(false);
          }
    };
    
    if (Platform.OS === 'web') { 
        if (confirm('Bạn có muốn xóa?')) confirmDelete(); 
    } else { 
        Alert.alert('Xác nhận', 'Bạn có muốn xóa mục này?', 
            [{ text: 'Hủy', style: 'cancel' }, { text: 'Xóa', style: 'destructive', onPress: confirmDelete }]
        ); 
    }
  };

  const handleConfirmBooking = async (bookingId: number, action: 'confirm' | 'reject', userName: string) => {
    const confirmAction = async () => {
        try {
            setLoading(true);
            const res = await api.post('/bookings/confirm', {
                booking_id: bookingId,
                action: action
            });
            if (res.data.success) {
                showAlert('Thành công', action === 'confirm' ? 'Đã xác nhận đặt lịch' : 'Đã từ chối đặt lịch');
                fetchData();
            }
        } catch (error: any) {
            showAlert('Lỗi', error.response?.data?.message || 'Không thể xử lý yêu cầu');
        } finally {
            setLoading(false);
        }
    };
    
    if (Platform.OS === 'web') {
        if (confirm(`Bạn có chắc muốn ${action === 'confirm' ? 'xác nhận' : 'từ chối'} lịch hẹn của ${userName}?`)) {
            confirmAction();
        }
    } else {
        Alert.alert(
            action === 'confirm' ? 'Xác nhận đặt lịch?' : 'Từ chối đặt lịch?',
            `Bạn có chắc muốn ${action === 'confirm' ? 'xác nhận' : 'từ chối'} lịch hẹn của ${userName}?`,
            [
                { text: 'Hủy', style: 'cancel' },
                { 
                    text: action === 'confirm' ? 'Xác nhận' : 'Từ chối',
                    style: action === 'confirm' ? 'default' : 'destructive',
                    onPress: confirmAction
                }
            ]
        );
    }
  };

  const renderBookings = () => (
    <ScrollView contentContainerStyle={{paddingBottom: 20}}>
        {bookings.length === 0 ? (
            <View style={{alignItems: 'center', paddingVertical: 40}}>
                <MaterialCommunityIcons name="calendar-check" size={64} color="#cbd5e1" />
                <Text style={{fontSize: 16, color: '#94a3b8', marginTop: 16}}>Không có lịch hẹn nào chờ xác nhận</Text>
            </View>
        ) : (
            bookings.map((booking: any) => (
                <View key={booking.id} style={styles.bookingCard}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12}}>
                        <View style={{flex: 1}}>
                            <Text style={{fontSize: 18, fontWeight: '600', color: '#1e293b'}}>{booking.user_name}</Text>
                            <Text style={{fontSize: 14, color: '#64748b', marginTop: 4}}>{booking.user_email}</Text>
                            {booking.user_phone && <Text style={{fontSize: 14, color: '#64748b'}}>📞 {booking.user_phone}</Text>}
                        </View>
                        <View style={{backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, height: 32}}>
                            <Text style={{fontSize: 12, fontWeight: '600', color: '#f59e0b'}}>Chờ xác nhận</Text>
                        </View>
                    </View>
                    <View style={{backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, marginBottom: 8}}>
                        <Text style={{fontSize: 15, color: '#334155'}}>📅 {booking.schedule_info}</Text>
                    </View>
                    <Text style={{fontSize: 13, color: '#94a3b8', marginBottom: 12}}>
                        Đặt lúc: {new Date(booking.created_at).toLocaleString('vi-VN')}
                    </Text>
                    <View style={{flexDirection: 'row', gap: 12}}>
                        <Pressable
                            style={{flex: 1, backgroundColor: '#ef4444', padding: 14, borderRadius: 8, alignItems: 'center'}}
                            onPress={() => handleConfirmBooking(booking.id, 'reject', booking.user_name)}
                        >
                            <Text style={{color: 'white', fontSize: 15, fontWeight: '600'}}>Từ chối</Text>
                        </Pressable>
                        <Pressable
                            style={{flex: 1, backgroundColor: '#22c55e', padding: 14, borderRadius: 8, alignItems: 'center'}}
                            onPress={() => handleConfirmBooking(booking.id, 'confirm', booking.user_name)}
                        >
                            <Text style={{color: 'white', fontSize: 15, fontWeight: '600'}}>Xác nhận</Text>
                        </Pressable>
                    </View>
                </View>
            ))
        )}
    </ScrollView>
  );

  const renderContent = () => {
        if (activeTab === 'trainer-schedules') {
            const matchesTrainerSchedule = (trainer: any, schedule: any) => {
                const trainerName = String(trainer.name || '').trim().toLowerCase();
                const trainerEmail = String(trainer.email || '').trim().toLowerCase();
                const scheduleTrainerName = String(schedule.trainer_name || '').trim().toLowerCase();
                const scheduleTrainerEmail = String(schedule.trainer_email || '').trim().toLowerCase();

                if (trainerEmail && scheduleTrainerEmail && trainerEmail === scheduleTrainerEmail) {
                    return true;
                }

                if (trainerName && scheduleTrainerName && trainerName === scheduleTrainerName) {
                    return true;
                }

                return Number(schedule.trainer_id) > 0 && Number(trainer.user_id ?? trainer.id) === Number(schedule.trainer_id);
            };

            const trainersWithSchedules = trainers.filter((trainer: any) =>
                trainerSchedules.some((schedule: any) => matchesTrainerSchedule(trainer, schedule))
            );
            const trainersWithoutSchedules = trainers.filter((trainer: any) =>
                !trainerSchedules.some((schedule: any) => matchesTrainerSchedule(trainer, schedule))
            );

            const renderTrainerScheduleCard = (trainer: any) => {
                const trainerKey = Number(trainer.user_id ?? trainer.id);
                const scheduleItems = trainerSchedules.filter((schedule: any) => matchesTrainerSchedule(trainer, schedule));
                const activeDays = scheduleItems.filter((s: any) => s.is_active).length;
                const isExpanded = expandedTrainerId === trainerKey;

                return (
                    <Pressable
                        key={trainer.id}
                        style={[styles.scheduleTrainerCard, isExpanded && styles.scheduleTrainerCardActive]}
                        onPress={() => setExpandedTrainerId((current) => (current === trainerKey ? null : trainerKey))}
                    >
                        <View style={styles.scheduleTrainerHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.scheduleTrainerName}>{trainer.name}</Text>
                                <Text style={styles.scheduleTrainerMeta}>{trainer.spec || trainer.bio || 'Chưa có chuyên môn'}</Text>
                            </View>
                            <View style={[styles.scheduleCountBadge, scheduleItems.length > 0 ? styles.scheduleCountBadgeOn : styles.scheduleCountBadgeOff]}>
                                <Text style={[styles.scheduleCountText, scheduleItems.length > 0 ? styles.scheduleCountTextOn : styles.scheduleCountTextOff]}>
                                    {scheduleItems.length > 0 ? `${activeDays} ngày` : 'Chưa đăng ký'}
                                </Text>
                            </View>
                        </View>

                        {isExpanded && (
                            <View style={styles.scheduleExpandArea}>
                                {scheduleItems.length > 0 ? (
                                    scheduleItems.map((schedule: any) => {
                                        // Format day of week
                                        const daysOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                        const dayName = daysOfWeek[schedule.day_of_week] || 'Không xác định';
                                        const isActive = schedule.is_active;
                                        
                                        return (
                                            <View key={schedule.id} style={styles.scheduleSlotCard}>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text style={styles.scheduleSlotTitle}>
                                                        {dayName}
                                                    </Text>
                                                    <Text style={[styles.scheduleSlotStatus, { color: isActive ? '#4ade80' : '#cbd5e1' }]}>
                                                        {isActive ? '✓ On' : '⊘ Off'}
                                                    </Text>
                                                </View>
                                                <Text style={styles.scheduleSlotTime}>
                                                    {schedule.start_time} - {schedule.end_time}
                                                </Text>
                                            </View>
                                        );
                                    })
                                ) : (
                                    <Text style={styles.scheduleEmptyState}>HLV này chưa đăng ký lịch làm.</Text>
                                )}
                            </View>
                        )}
                    </Pressable>
                );
            };

            return (
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardTitle}>Lịch làm HLV</Text>
                            <Text style={styles.cardSubtitle}>Chạm vào từng HLV để xem khung giờ đã đăng ký</Text>
                        </View>
                    </View>

                    <View style={styles.scheduleSummaryGrid}>
                        <View style={styles.scheduleSummaryCard}>
                            <Text style={styles.scheduleSummaryLabel}>Đã đăng ký lịch</Text>
                            <Text style={styles.scheduleSummaryValue}>{trainersWithSchedules.length}</Text>
                        </View>
                        <View style={styles.scheduleSummaryCard}>
                            <Text style={styles.scheduleSummaryLabel}>Chưa đăng ký</Text>
                            <Text style={styles.scheduleSummaryValue}>{trainersWithoutSchedules.length}</Text>
                        </View>
                    </View>

                    <Text style={styles.scheduleSectionLabel}>HLV đã đăng ký lịch</Text>
                    <View style={styles.scheduleList}>
                        {trainersWithSchedules.length === 0 ? (
                            <Text style={styles.scheduleEmptyState}>Chưa có HLV nào đăng ký lịch.</Text>
                        ) : (
                            trainersWithSchedules.map(renderTrainerScheduleCard)
                        )}
                    </View>

                    <Text style={styles.scheduleSectionLabel}>HLV chưa đăng ký lịch</Text>
                    <View style={styles.scheduleList}>
                        {trainersWithoutSchedules.length === 0 ? (
                            <Text style={styles.scheduleEmptyState}>Tất cả HLV đã có lịch đăng ký.</Text>
                        ) : (
                            trainersWithoutSchedules.map(renderTrainerScheduleCard)
                        )}
                    </View>
                </View>
            );
        }

    if (activeTab === 'bookings') {
      return renderBookings();
    }
    
    let data: any[] = [];
    if (activeTab === 'classes') data = classes;
    else if (activeTab === 'trainers') data = trainers;
    else if (activeTab === 'packages') data = packages;
    else if (activeTab === 'members') data = members;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{activeTab === 'trainers' ? 'Danh sách huấn luyện viên' : activeTab === 'classes' ? 'Danh sách lớp tập' : activeTab === 'packages' ? 'Danh sách gói tập' : 'Danh sách thành viên'}</Text>
            <Pressable style={styles.addBtn} onPress={() => openModal(null)}><Ionicons name="add" size={18} color="#fff" /><Text style={styles.addBtnText}>Thêm mới</Text></Pressable>
        </View>
        <ScrollView horizontal contentContainerStyle={{minWidth: '100%'}}>
            <View style={{width: '100%', minWidth: (activeTab === 'classes' || activeTab === 'members') ? 1000 : 900}}>
                <View style={styles.tableHeader}>
                    {activeTab === 'trainers' ? (
                        <>
                            <Text style={[styles.th, {flex: 2}]}>Tên</Text>
                            <Text style={[styles.th, {flex: 2}]}>Chuyên môn</Text>
                            <Text style={[styles.th, {flex: 1}]}>Kinh nghiệm</Text>
                            <Text style={[styles.th, {flex: 1}]}>Đánh giá</Text>
                            <Text style={[styles.th, {flex: 1.5}]}>Giá/buổi</Text>
                            <Text style={[styles.th, {flex: 2}]}>Thời gian</Text>
                        </>
                    ) : activeTab === 'classes' ? (
                        <>
                            <Text style={[styles.th, {flex: 2}]}>Tên lớp</Text>
                            <Text style={[styles.th, {flex: 2}]}>HLV</Text>
                            <Text style={[styles.th, {flex: 1}]}>Giờ</Text>
                            <Text style={[styles.th, {flex: 1.5}]}>Địa điểm</Text>
                            <Text style={[styles.th, {flex: 1}]}>Chỗ</Text>
                            <Text style={[styles.th, {flex: 1}]}>ĐK</Text>
                            <Text style={[styles.th, {flex: 1.5}]}>Giá</Text>
                        </>
                    ) : activeTab === 'packages' ? (
                        <>
                            <Text style={[styles.th, {flex: 2}]}>Tên gói</Text>
                            <Text style={[styles.th, {flex: 1.5}]}>Thời hạn</Text>
                            <Text style={[styles.th, {flex: 1.5}]}>Giá</Text>
                            <Text style={[styles.th, {flex: 1.5}]}>Quyền lợi</Text>
                            <Text style={[styles.th, {flex: 1.5}]}>Màu</Text>
                            <Text style={[styles.th, {flex: 1.5}]}>Trạng thái</Text>
                        </>
                    ) : (
                            <>
                                <Text style={[styles.th, {flex: 2}]}>Tên</Text>
                                <Text style={[styles.th, {flex: 2.2}]}>Email</Text>
                                <Text style={[styles.th, {flex: 1.3}]}>SĐT</Text>
                                <Text style={[styles.th, {flex: 1.4}]}>Gói</Text>
                                <Text style={[styles.th, {flex: 1.4}]}>Hết hạn</Text>
                                <Text style={[styles.th, {flex: 1}]}>Trạng thái</Text>
                            </>
                    )}
                    <Text style={[styles.th, {flex: 1, textAlign: 'right'}]}>Thao tác</Text>
                </View>

                {(data || []).map((item: any) => (
                    <View key={item.id} style={styles.tableRow}>
                        {activeTab === 'trainers' ? (
                            <>
                                <View style={{flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8}}>
                                    {/* --- DÙNG HÀM getSmartImageUrl ĐỂ HIỂN THỊ ẢNH --- */}
                                    <Image 
                                        key={item.updated_at || item.id} 
                                        source={{ 
                                            // Thử lấy item.image (tên cột DB), nếu không có thì thử item.image_url
                                            uri: getSmartImageUrl(item.image || item.image_url) 
                                        }} 
                                        style={{width: 32, height: 32, borderRadius: 16, backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: '#cbd5e1'}}
                                    />
                                    <Text style={[styles.td, {fontWeight: '600'}]}>{item.name}</Text>
                                </View>
                                <Text style={[styles.td, {flex: 2}]}>{item.spec}</Text>
                                <Text style={[styles.td, {flex: 1}]}>{item.exp}</Text>
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                    <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
                                    <Text style={[styles.td, {fontWeight: '700', marginLeft: 4}]}>{item.rating}</Text>
                                </View>
                                <Text style={[styles.td, {flex: 1.5}]}>{formatMoney(Number(item.price))}</Text>
                                <Text style={[styles.td, {flex: 2, color: '#64748b'}]}>{item.availability}</Text>
                            </>
                        ) : activeTab === 'classes' ? (
                            <>
                                <Text style={[styles.td, {flex: 2, fontWeight: '600'}]}>{item.name}</Text>
                                <Text style={[styles.td, {flex: 2, color: '#64748b'}]}>{item.trainer_name || item.trainerName}</Text>
                                <Text style={[styles.td, {flex: 1}]}>{item.time}</Text>
                                <Text style={[styles.td, {flex: 1.5}]}>{item.location}</Text>
                                <Text style={[styles.td, {flex: 1}]}>{item.capacity}</Text>
                                <View style={{flex: 1}}>
                                    <View style={{backgroundColor: (item.registered/item.capacity) > 0.8 ? (isDark ? '#713f12' : '#fef3c7') : (isDark ? '#14532d' : '#dcfce7'), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start'}}>
                                        <Text style={{fontSize: 11, fontWeight: '700', color: (item.registered/item.capacity) > 0.8 ? (isDark ? '#fbbf24' : '#d97706') : (isDark ? '#4ade80' : '#166534')}}>{item.registered}/{item.capacity}</Text>
                                    </View>
                                </View>
                                <Text style={[styles.td, {flex: 1.5}]}>{formatMoney(Number(item.price))}</Text>
                            </>
                        ) : activeTab === 'packages' ? (
                            <>
                                <View style={{flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6}}>
                                    <Text style={[styles.td, {fontWeight: '700'}]}>{item.name}</Text>
                                    {(item.is_popular === 1 || item.isPopular) && <View style={{backgroundColor: isDark ? '#1e3a8a' : '#dbeafe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4}}><Text style={{fontSize: 10, color: isDark ? '#93c5fd' : '#2563eb', fontWeight: '600'}}>Phổ biến</Text></View>}
                                </View>
                                <Text style={[styles.td, {flex: 1.5}]}>{item.duration} tháng</Text>
                                <View style={{flex: 1.5}}>
                                    <Text style={[styles.td, {fontWeight: '700'}]}>{formatMoney(Number(item.price))}</Text>
                                    {(item.old_price || item.oldPrice) ? <Text style={{fontSize: 11, color: '#94a3b8', textDecorationLine: 'line-through'}}>{formatMoney(Number(item.old_price || item.oldPrice))}</Text> : null}
                                </View>
                                <Text style={[styles.td, {flex: 1.5}]}>{item.benefits} quyền lợi</Text>
                                <View style={{flex: 1.5}}>
                                    <View style={{backgroundColor: item.color === 'amber' ? (isDark ? '#713f12' : '#fffbeb') : (item.color === 'green' ? (isDark ? '#14532d' : '#dcfce7') : (item.color === 'purple' ? (isDark ? '#581c87' : '#f3e8ff') : (isDark ? '#1e3a8a' : '#dbeafe'))), paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start'}}>
                                        <Text style={{fontSize: 11, fontWeight: '600', color: colors.text}}>{item.color}</Text>
                                    </View>
                                </View>
                                <View style={{flex: 1.5}}>
                                    <View style={[styles.statusBadge, { backgroundColor: statusPalette(item.status === 'active').bg }]}>
                                        <Text style={[styles.statusText, { color: statusPalette(item.status === 'active').fg }]}>{item.status === 'active' ? 'Hoạt động' : 'Ngừng HĐ'}</Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.td, {flex: 2, fontWeight: '600'}]}>{item.name}</Text>
                                <Text style={[styles.td, {flex: 2.2}]}>{item.email}</Text>
                                <Text style={[styles.td, {flex: 1.3}]}>{item.phone || ''}</Text>
                                <Text style={[styles.td, {flex: 1.4}]}>{item.pack}</Text>
                                <Text style={[styles.td, {flex: 1.4}]}>{item.end}</Text>
                                <View style={{flex: 1}}>
                                    <View style={[styles.statusBadge, { backgroundColor: statusPalette(item.status === 'active').bg }]}>
                                        <Text style={[styles.statusText, { color: statusPalette(item.status === 'active').fg }]}>{item.status === 'active' ? 'Hoạt động' : 'Hết hạn'}</Text>
                                    </View>
                                </View>
                            </>
                        )}

                        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 10}}>
                            <Pressable style={styles.actionBtn} onPress={() => openModal(item)}><MaterialCommunityIcons name="square-edit-outline" size={18} color="#2563eb" /></Pressable>
                            <Pressable style={styles.actionBtn} onPress={() => handleDelete(item.id)}><MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" /></Pressable>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
      </View>
    );
  };

  const renderModalContent = () => {
    const handlePickExistingUser = (user: any) => {
        setSelectedUserId(user.id);
        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
        }));
        setMemberFormMode('manual');
    };

    const filteredAvailableUsers = (availableUsers || []).filter(u => {
        const keyword = userSearch.toLowerCase();
        return u.name?.toLowerCase().includes(keyword) || u.email?.toLowerCase().includes(keyword);
    }).slice(0, 12);

    return (
        <ScrollView 
            style={{ width: '100%', maxHeight: 450 }} 
            contentContainerStyle={{paddingBottom: 40}}
            showsVerticalScrollIndicator={true}
        >
            {activeTab === 'trainers' && (
                <>
                    <Text style={styles.label}>Tên</Text><TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} placeholder="VD: Nguyễn Văn A" placeholderTextColor="#94a3b8" />
                    <Text style={styles.label}>Email (Tài khoản đăng nhập)</Text>
                    <TextInput 
                        style={styles.input} 
                        value={formData.email} 
                        onChangeText={t => setFormData({...formData, email: t})} 
                        placeholder="trainer@example.com"
                        placeholderTextColor="#94a3b8"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Text style={styles.label}>Hình ảnh</Text>
                    <View style={{flexDirection: 'row', gap: 12, alignItems: 'center'}}>
                        <Pressable 
                            style={{backgroundColor: '#3b82f6', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8}}
                            onPress={pickImage}
                        >
                            <Text style={{color: 'white', fontWeight: '600'}}>Chọn ảnh từ máy</Text>
                        </Pressable>
                        {formData.image_url ? (
                          <>
                            <View style={{width: 60, height: 60, borderRadius: 8, overflow: 'hidden', backgroundColor: '#f0f9ff', justifyContent: 'center', alignItems: 'center'}}>
                                <Image source={{uri: formData.image_url}} style={{width: '100%', height: '100%'}} />
                            </View>
                            <Pressable 
                              style={{backgroundColor: '#ef4444', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8}}
                              onPress={() => setFormData({...formData, image_url: '', removeImage: true})}
                            >
                              <Text style={{color: 'white', fontWeight: '700'}}>Xóa ảnh</Text>
                            </Pressable>
                          </>
                        ) : null}
                    </View>
                    <Text style={styles.label}>Chuyên môn</Text><TextInput style={styles.input} value={formData.spec} onChangeText={t => setFormData({...formData, spec: t})} placeholder="VD: Yoga & Pilates" placeholderTextColor="#94a3b8" />
                    <View style={{flexDirection: 'row', gap: 16}}>
                        <View style={{flex: 1}}><Text style={styles.label}>Kinh nghiệm</Text><TextInput style={styles.input} value={formData.exp} onChangeText={t => setFormData({...formData, exp: t})} placeholder="VD: 5 năm" placeholderTextColor="#94a3b8"/></View>
                        <View style={{flex: 1}}><Text style={styles.label}>Đánh giá</Text><TextInput style={styles.input} value={formData.rating} onChangeText={t => setFormData({...formData, rating: t})} placeholder="5.0" placeholderTextColor="#94a3b8"/></View>
                        <View style={{flex: 1}}><Text style={styles.label}>Giá/buổi</Text><TextInput style={styles.input} value={formData.price} onChangeText={t => setFormData({...formData, price: t.replace(/[^0-9]/g, '')})} keyboardType="numeric" placeholder="200000" placeholderTextColor="#94a3b8"/></View>
                    </View>
                </>
            )}

            {/* --- FIX LỖI GIAO DIỆN MODAL LỚP TẬP --- */}
            {activeTab === 'classes' && (
                <>
                    <Text style={styles.label}>Tên lớp</Text>
                    <TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} placeholder="VD: Yoga sáng" placeholderTextColor="#94a3b8" />

                    <View style={{flexDirection: 'row', gap: 16}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Huấn luyện viên</Text>
                            <Pressable 
                                style={[styles.input, {justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingRight: 10}]}
                                onPress={() => setShowTrainerDropdown(!showTrainerDropdown)}
                            >
                                <Text style={{fontSize: 15, color: formData.trainerName ? '#0f172a' : '#94a3b8'}}>
                                    {formData.trainerName || 'Chọn huấn luyện viên'}
                                </Text>
                                <MaterialCommunityIcons name={showTrainerDropdown ? "chevron-up" : "chevron-down"} size={20} color="#94a3b8" />
                            </Pressable>
                            {showTrainerDropdown && (
                                <View style={{borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, marginTop: 4, maxHeight: 200, overflow: 'hidden', backgroundColor: '#fff'}}>
                                    <ScrollView>
                                        {trainers.map((trainer) => (
                                            <Pressable 
                                                key={trainer.id} 
                                                onPress={() => {
                                                    setFormData({...formData, trainerName: trainer.name});
                                                    setShowTrainerDropdown(false);
                                                }} 
                                                style={{paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9'}}
                                            >
                                                <Text style={{fontSize: 14, color: formData.trainerName === trainer.name ? '#2563eb' : '#334155', fontWeight: formData.trainerName === trainer.name ? '600' : '400'}}>
                                                    {trainer.name}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                        <View style={{flex: 1}}><Text style={styles.label}>Địa điểm</Text><TextInput style={styles.input} value={formData.location} onChangeText={t => setFormData({...formData, location: t})} placeholder="VD: Lớp A" placeholderTextColor="#94a3b8" /></View>
                    </View>

                    <View style={{flexDirection: 'row', gap: 16}}>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Giờ tập</Text>
                            <View style={styles.timePickerContainer}>
                                <TextInput style={styles.timeInput} value={formData.timeHour} onChangeText={t => { if(t.length <= 2) setFormData({...formData, timeHour: t}) }} placeholder="00" placeholderTextColor="#94a3b8" keyboardType="numeric" maxLength={2} />
                                <Text style={styles.timeSeparator}>:</Text>
                                <TextInput style={styles.timeInput} value={formData.timeMinute} onChangeText={t => { if(t.length <= 2) setFormData({...formData, timeMinute: t}) }} placeholder="00" placeholderTextColor="#94a3b8" keyboardType="numeric" maxLength={2} />
                                <Pressable style={styles.amPmBtn} onPress={() => setFormData({...formData, timeMode: formData.timeMode === 'AM' ? 'PM' : 'AM'})}>
                                    <Text style={styles.amPmText}>{formData.timeMode}</Text>
                                </Pressable>
                            </View>
                        </View>
                        <View style={{flex: 1}}><Text style={styles.label}>Thời lượng</Text><TextInput style={styles.input} value={formData.duration} onChangeText={t => setFormData({...formData, duration: t})} placeholder="60 phút" placeholderTextColor="#94a3b8"/></View>
                    </View>

                    {/* Tách Ngày tập ra dòng riêng */}
                    <View style={{marginTop: 8}}>
                        <Text style={styles.label}>Ngày tập (chỉ ngày trong tương lai)</Text>
                        {Platform.OS === 'web' ? (
                            <View style={{gap: 8}}>
                                <View style={{borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, overflow: 'hidden', backgroundColor: '#fff'}}>
                                    {React.createElement('input', {
                                        ref: webClassDateInputRef,
                                        type: 'date',
                                        min: (() => {
                                            const d = new Date();
                                            d.setDate(d.getDate() + 1);
                                            const y = d.getFullYear();
                                            const m = String(d.getMonth() + 1).padStart(2, '0');
                                            const day = String(d.getDate()).padStart(2, '0');
                                            return `${y}-${m}-${day}`;
                                        })(),
                                        value: formData.days ? displayDateToIso(formData.days.split(',').map(d => d.trim()).filter(Boolean).slice(-1)[0] || '') : '',
                                        onChange: (e: any) => {
                                            const val = e.target.value as string;
                                            if (!val) return;
                                            const formatted = isoDateToDisplay(val);
                                            const currentDates = formData.days ? formData.days.split(',').map(d => d.trim()).filter(Boolean) : [];
                                            if (!currentDates.includes(formatted)) {
                                                setFormData({...formData, days: [...currentDates, formatted].join(', ')});
                                            }
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '11px 12px',
                                            fontSize: '15px',
                                            border: 'none',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                        },
                                    })}
                                </View>

                                {formData.days && (
                                    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                                        {formData.days.split(',').map((dateStr, idx) => (
                                            <View 
                                                key={idx} 
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    backgroundColor: '#eff6ff',
                                                    borderWidth: 1,
                                                    borderColor: '#2563eb',
                                                    borderRadius: 20,
                                                    paddingVertical: 6,
                                                    paddingHorizontal: 10
                                                }}
                                            >
                                                <Text style={{fontSize: 13, color: '#2563eb', fontWeight: '500'}}>{dateStr.trim()}</Text>
                                                <Pressable 
                                                    onPress={() => {
                                                        const dates = formData.days.split(',').filter((_, i) => i !== idx);
                                                        setFormData({...formData, days: dates.map(d => d.trim()).join(', ')});
                                                    }}
                                                >
                                                    <MaterialCommunityIcons name="close-circle" size={16} color="#2563eb" />
                                                </Pressable>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ) : (
                            <>
                                <View style={{flexDirection: 'row', gap: 8, alignItems: 'flex-start'}}>
                                    <TextInput 
                                        style={[styles.input, {flex: 1, marginTop: 0}]} 
                                        value={formData.days} 
                                        onChangeText={t => setFormData({...formData, days: t})} 
                                        placeholder="VD: 15-04-2026, 17-04-2026" 
                                        placeholderTextColor="#94a3b8"
                                        editable={false}
                                    />
                                    <Pressable 
                                        style={{width: 44, height: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2563eb', marginTop: 0, zIndex: 10}}
                                        onPress={() => {
                                            setSelectedDateForClass(new Date());
                                            setShowDatePicker(true);
                                        }}
                                    >
                                        <MaterialCommunityIcons name="calendar" size={20} color="#fff" />
                                    </Pressable>
                                </View>

                                {formData.days && (
                                    <View style={{marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                                        {formData.days.split(',').map((dateStr, idx) => (
                                            <View 
                                                key={idx} 
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    backgroundColor: '#eff6ff',
                                                    borderWidth: 1,
                                                    borderColor: '#2563eb',
                                                    borderRadius: 20,
                                                    paddingVertical: 6,
                                                    paddingHorizontal: 10
                                                }}
                                            >
                                                <Text style={{fontSize: 13, color: '#2563eb', fontWeight: '500'}}>{dateStr.trim()}</Text>
                                                <Pressable 
                                                    onPress={() => {
                                                        const dates = formData.days.split(',').filter((_, i) => i !== idx);
                                                        setFormData({...formData, days: dates.map(d => d.trim()).join(', ')});
                                                    }}
                                                >
                                                    <MaterialCommunityIcons name="close-circle" size={16} color="#2563eb" />
                                                </Pressable>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}

                        <Text style={{fontSize: 12, color: '#94a3b8', marginTop: 8}}>Chọn từ lịch hoặc nhập tay. Định dạng: dd-MM-yyyy</Text>
                    </View>

                    <View style={{flexDirection: 'row', gap: 16}}>
                        <View style={{flex: 1}}><Text style={styles.label}>Sức chứa</Text><TextInput style={styles.input} value={formData.capacity} onChangeText={t => setFormData({...formData, capacity: t})} keyboardType="numeric" placeholder="30" placeholderTextColor="#94a3b8"/></View>
                        <View style={{flex: 1}}><Text style={styles.label}>Đã đăng ký</Text><TextInput style={styles.input} value={formData.registered} onChangeText={t => setFormData({...formData, registered: t})} keyboardType="numeric" placeholder="0" placeholderTextColor="#94a3b8"/></View>
                        <View style={{flex: 1}}><Text style={styles.label}>Giá (VNĐ)</Text><TextInput style={styles.input} value={formData.price} onChangeText={t => setFormData({...formData, price: t.replace(/[^0-9]/g, '')})} keyboardType="numeric" placeholder="250000" placeholderTextColor="#94a3b8"/></View>
                    </View>
                </>
            )}

            {activeTab === 'packages' && (
                <>
                    <Text style={styles.label}>Tên gói</Text><TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} placeholder="VD: Gói Premium" placeholderTextColor="#94a3b8" />
                    <View style={{flexDirection: 'row', gap: 16}}>
                        <View style={{flex: 1}}><Text style={styles.label}>Thời hạn (tháng)</Text><TextInput style={styles.input} value={formData.duration} onChangeText={t => setFormData({...formData, duration: t})} placeholder="3" placeholderTextColor="#94a3b8" keyboardType="numeric" /></View>
                        <View style={{flex: 1}}>
                            <Text style={styles.label}>Màu sắc</Text>
                            <View style={styles.selectContainer}>
                                {COLOR_OPTIONS.map((opt) => (
                                    <Pressable key={opt.value} onPress={() => setFormData({...formData, color: opt.value})} style={[styles.colorOption, formData.color === opt.value && {borderColor: opt.code, backgroundColor: opt.code + '20'}]}><View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: opt.code, marginRight: 6}} /><Text style={{fontSize: 12, color: '#334155'}}>{opt.label}</Text></Pressable>
                                ))}
                            </View>
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', gap: 16}}>
                        <View style={{flex: 1}}><Text style={styles.label}>Giá (VNĐ)</Text><TextInput style={styles.input} value={formData.price} keyboardType="numeric" onChangeText={t => setFormData({...formData, price: t.replace(/[^0-9]/g, '')})} placeholder="1200000" placeholderTextColor="#94a3b8" /></View>
                        <View style={{flex: 1}}><Text style={styles.label}>Giá gốc (VNĐ)</Text><TextInput style={styles.input} value={formData.oldPrice} onChangeText={t => setFormData({...formData, oldPrice: t.replace(/[^0-9]/g, '')})} keyboardType="numeric" placeholder="1500000" placeholderTextColor="#94a3b8"/></View>
                    </View>
                    <Text style={styles.label}>Quyền lợi (mỗi dòng 1 quyền lợi)</Text><TextInput style={[styles.input, {height: 100, textAlignVertical: 'top'}]} value={formData.benefitsText} onChangeText={t => setFormData({...formData, benefitsText: t})} multiline numberOfLines={4} placeholder="Tập không giới hạn&#10;Phòng gym cao cấp&#10;Bể bơi miễn phí" placeholderTextColor="#94a3b8" />
                    <Pressable style={styles.checkboxRow} onPress={() => setFormData({...formData, isPopular: !formData.isPopular})}><MaterialCommunityIcons name={formData.isPopular ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={formData.isPopular ? "#2563eb" : "#94a3b8"} /><Text style={styles.checkboxText}>Đánh dấu là gói phổ biến nhất</Text></Pressable>
                </>
            )}

            {activeTab === 'members' && (
                <>
                    <View style={{flexDirection: 'row', marginBottom: 12}}>
                        <Pressable
                            onPress={() => { setMemberFormMode('pick'); }}
                            style={[styles.subTab, memberFormMode === 'pick' && styles.subTabActive]}
                        >
                            <Text style={[styles.subTabText, memberFormMode === 'pick' && styles.subTabTextActive]}>Chọn user có sẵn</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => { setMemberFormMode('manual'); setSelectedUserId(null); setFormData(prev => ({...prev, name: '', email: '', phone: ''})); }}
                            style={[styles.subTab, memberFormMode === 'manual' && styles.subTabActive]}
                        >
                            <Text style={[styles.subTabText, memberFormMode === 'manual' && styles.subTabTextActive]}>Nhập thủ công</Text>
                        </Pressable>
                    </View>

                    {memberFormMode === 'pick' && (
                        <>
                            <Text style={styles.label}>Tìm user (chưa là member)</Text>
                            <TextInput
                                style={[styles.input, {marginBottom: 8}]}
                                placeholder="Tìm theo tên hoặc email"
                                placeholderTextColor="#94a3b8"
                                value={userSearch}
                                onChangeText={setUserSearch}
                            />
                            <View style={{borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, maxHeight: 200, overflow: 'hidden', marginBottom: 12}}>
                                <ScrollView>
                                    {filteredAvailableUsers.map((u) => (
                                        <Pressable
                                            key={u.id}
                                            onPress={() => handlePickExistingUser(u)}
                                            style={[styles.userOption, selectedUserId === u.id && styles.userOptionActive]}
                                        >
                                            <View>
                                                <Text style={[styles.userOptionTitle, selectedUserId === u.id && styles.userOptionTitleActive]}>{u.name || 'Không tên'}</Text>
                                                <Text style={styles.userOptionSub}>{u.email}</Text>
                                                {u.phone ? <Text style={styles.userOptionSub}>📞 {u.phone}</Text> : null}
                                            </View>
                                        </Pressable>
                                    ))}

                                    {filteredAvailableUsers.length === 0 && (
                                        <View style={styles.userOption}> 
                                            <Text style={styles.userOptionSub}>Không có user phù hợp</Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                            <Text style={{fontSize: 12, color: '#64748b', marginBottom: 4}}>Chọn user sẽ tự điền sang tab Nhập thủ công.</Text>
                        </>
                    )}

                    {memberFormMode === 'manual' && (
                        <>
                            <Text style={styles.label}>Tên thành viên</Text><TextInput style={styles.input} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} placeholder="VD: Nguyễn Văn A" placeholderTextColor="#94a3b8" />
                            <Text style={styles.label}>Email</Text><TextInput style={styles.input} value={formData.email} onChangeText={t => setFormData({...formData, email: t})} keyboardType="email-address" placeholder="member@example.com" placeholderTextColor="#94a3b8"/>
                            <Text style={styles.label}>Số điện thoại (tuỳ chọn)</Text><TextInput style={styles.input} value={formData.phone} onChangeText={t => setFormData({...formData, phone: t})} keyboardType="phone-pad" placeholder="0912345678" placeholderTextColor="#94a3b8"/>
                            <Text style={styles.label}>Gói thành viên</Text>
                            <View style={styles.selectContainer}>
                                {packages.map((pkg) => (
                                    <Pressable key={pkg.id} onPress={() => setFormData({...formData, pack: pkg.name})} style={[styles.selectOption, formData.pack === pkg.name && styles.selectOptionActive]}><Text style={[styles.selectText, formData.pack === pkg.name && styles.selectTextActive]}>{pkg.name}</Text></Pressable>
                                ))}
                            </View>
                            <View style={{flexDirection: 'row', gap: 10}}>
                                <View style={{flex: 1}}><Text style={styles.label}>Ngày bắt đầu</Text><TextInput style={styles.input} value={formData.start} onChangeText={t => setFormData({...formData, start: t})} placeholder="dd/mm/yyyy" placeholderTextColor="#94a3b8"/></View>
                                <View style={{flex: 1}}><Text style={styles.label}>Ngày kết thúc (Auto)</Text><TextInput style={[styles.input, {backgroundColor: '#f1f5f9'}]} value={formData.end} editable={false} /></View>
                            </View>
                            <Text style={styles.label}>Trạng thái</Text>
                            <View style={styles.selectContainer}>
                                <Pressable onPress={() => setFormData({...formData, status: 'active'})} style={[styles.selectOption, formData.status === 'active' && styles.selectOptionActive]}><Text style={[styles.selectText, formData.status === 'active' && styles.selectTextActive]}>Hoạt động</Text></Pressable>
                                <Pressable onPress={() => setFormData({...formData, status: 'expired'})} style={[styles.selectOption, formData.status === 'expired' && styles.selectOptionActive]}><Text style={[styles.selectText, formData.status === 'expired' && styles.selectTextActive]}>Hết hạn</Text></Pressable>
                            </View>
                        </>
                    )}
                </>
            )}
        </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Quản trị hệ thống</Text>
            <Text style={styles.pageSubtitle}>Quản lý dữ liệu tập trung</Text>
        </View>

                {loading && (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="small" color={UI.colors.primary} />
                        <Text style={styles.loadingText}>Đang đồng bộ dữ liệu...</Text>
                    </View>
                )}

        <Reveal delay={80}>{renderContent()}</Reveal>

        <Modal animationType={motionMode === 'off' ? 'none' : 'fade'} transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ width: '100%', maxWidth: 500, alignItems: 'center' }}
                >
                    <View style={styles.modalContent}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                            <Text style={styles.modalTitle}>{editingItem ? 'Chỉnh sửa' : 'Thêm mới'} {activeTab === 'classes' ? 'lớp tập' : activeTab === 'trainers' ? 'huấn luyện viên' : activeTab === 'packages' ? 'gói thành viên' : 'thành viên'}</Text>
                            <Pressable onPress={() => setModalVisible(false)}><Ionicons name="close" size={24} color="#94a3b8" /></Pressable>
                        </View>

                        {/* --- Container cho phần Scroll --- */}
                        <View style={{width: '100%', maxHeight: 500}}>
                            {renderModalContent()}
                        </View>

                        <View style={styles.modalButtons}>
                            <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnTextCancel}>Hủy</Text>
                            </Pressable>
                            <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSave}>
                                <Text style={styles.btnTextSave}>
                                    {editingItem ? 'Cập nhật' : 'Thêm mới'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>

        {/* Date Picker for Class Dates */}
        {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
                value={selectedDateForClass}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                    if (event.type === 'dismissed') {
                        setShowDatePicker(false);
                        return;
                    }
                    if (selectedDate) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        selectedDate.setHours(0, 0, 0, 0);
                        
                        if (selectedDate.getTime() <= today.getTime()) {
                            Alert.alert('Lỗi', 'Vui lòng chọn ngày trong tương lai');
                            return;
                        }

                        const formattedDate = formatDateFromDateObject(selectedDate);
                        const currentDates = formData.days ? formData.days.split(', ') : [];
                        
                        if (!currentDates.includes(formattedDate)) {
                            const newDates = [...currentDates, formattedDate].filter(d => d.trim());
                            setFormData({...formData, days: newDates.join(', ')});
                        }
                        
                        setShowDatePicker(false);
                    }
                }}
                minimumDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
            />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: UI.colors.bg },
  scrollContent: { padding: 24, paddingBottom: 50, maxWidth: 1400, marginHorizontal: 'auto', width: '100%' },
  pageHeader: { marginBottom: 24 },
    pageTitle: { fontSize: 30, fontWeight: '800', color: UI.colors.text, fontFamily: UI.font.heading },
    pageSubtitle: { fontSize: 14, color: UI.colors.textMuted, fontFamily: UI.font.body },
    loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    loadingText: { fontSize: 13, color: UI.colors.textMuted, fontFamily: UI.font.body },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: UI.colors.border, ...UI.shadow.card },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    cardTitle: { fontSize: 18, fontWeight: '700', fontFamily: UI.font.heading },
    addBtn: { flexDirection: 'row', backgroundColor: UI.colors.primary, padding: 8, borderRadius: 6, alignItems: 'center' },
  addBtnText: { color: '#fff', marginLeft: 4, fontWeight: '600', fontSize: 13 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#e2e8f0', paddingBottom: 10, marginBottom: 10 },
  th: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f1f5f9', alignItems: 'center' },
  td: { fontSize: 14, color: '#334155' },
  actionBtn: { padding: 6, backgroundColor: '#f1f5f9', borderRadius: 6 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', width: '100%', borderRadius: 12, padding: 24, shadowColor: '#000', elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10, fontSize: 15, color: '#0f172a' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  btn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  btnCancel: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  btnSave: { backgroundColor: '#2563eb' },
  btnTextCancel: { color: '#64748b', fontWeight: '600' },
  btnTextSave: { color: '#fff', fontWeight: '600' },
  selectContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectOption: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#fff' },
  selectOptionActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  selectText: { fontSize: 13, color: '#64748b' },
  selectTextActive: { color: '#2563eb', fontWeight: '600' },
  colorOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  checkboxText: { marginLeft: 8, fontSize: 14, color: '#334155', fontWeight: '500' },
  statusBadge: { padding: 4, borderRadius: 4, alignSelf: 'flex-start' },
  statusActive: { backgroundColor: '#dcfce7' },
  statusInactive: { backgroundColor: '#f1f5f9' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: '#166534' },
  statusTextInactive: { color: '#64748b' },
    userOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#fff' },
    userOptionActive: { backgroundColor: '#eff6ff' },
    userOptionTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
    userOptionTitleActive: { color: '#1d4ed8' },
    userOptionSub: { fontSize: 12, color: '#64748b' },
    subTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
    subTabActive: { backgroundColor: '#2563eb10', borderColor: '#2563eb' },
    subTabText: { fontSize: 13, fontWeight: '600', color: '#475569' },
    subTabTextActive: { color: '#1d4ed8' },

  // Styles Time Picker
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 48,
  },
  timeInput: {
    fontSize: 16,
    color: '#0f172a',
    width: 30,
    textAlign: 'center',
    padding: 0,
  },
  timeSeparator: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginHorizontal: 4,
  },
  amPmBtn: {
    backgroundColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  amPmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
  },
    cardSubtitle: {
        marginTop: 4,
        fontSize: 13,
        color: '#64748b',
    },
    scheduleSummaryGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    scheduleSummaryCard: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#dbeafe',
        borderRadius: 12,
        padding: 14,
    },
    scheduleSummaryLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748b',
        marginBottom: 4,
    },
    scheduleSummaryValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0f172a',
    },
    scheduleSectionLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: '#0f172a',
        marginTop: 6,
        marginBottom: 10,
    },
    scheduleList: {
        gap: 10,
        marginBottom: 16,
    },
    scheduleTrainerCard: {
        borderWidth: 1,
        borderColor: '#dbeafe',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
    },
    scheduleTrainerCardActive: {
        borderColor: '#2563eb',
        backgroundColor: '#eff6ff',
    },
    scheduleTrainerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    scheduleTrainerName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#0f172a',
    },
    scheduleTrainerMeta: {
        marginTop: 3,
        fontSize: 12,
        color: '#64748b',
    },
    scheduleCountBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    scheduleCountBadgeOn: {
        backgroundColor: '#dcfce7',
    },
    scheduleCountBadgeOff: {
        backgroundColor: '#f1f5f9',
    },
    scheduleCountText: {
        fontSize: 11,
        fontWeight: '800',
    },
    scheduleCountTextOn: {
        color: '#166534',
    },
    scheduleCountTextOff: {
        color: '#64748b',
    },
    scheduleExpandArea: {
        marginTop: 12,
        gap: 10,
    },
    scheduleSlotCard: {
        borderWidth: 1,
        borderColor: '#bfdbfe',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
    },
    scheduleSlotTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#0f172a',
    },
    scheduleSlotTime: {
        marginTop: 4,
        fontSize: 13,
        color: '#2563eb',
        fontWeight: '700',
    },
    scheduleSlotMeta: {
        marginTop: 4,
        fontSize: 12,
        color: '#475569',
    },
    scheduleSlotStatus: {
        marginTop: 4,
        fontSize: 12,
        color: '#0f172a',
        fontWeight: '700',
    },
    scheduleEmptyState: {
        fontSize: 13,
        color: '#64748b',
    },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
});