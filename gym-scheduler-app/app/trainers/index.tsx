import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, StatusBar,
  Modal, Alert, Platform, Image, TextInput, ScrollView, useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { useCart } from '../../src/api/context/CartContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../src/api/context/AuthContext';
import { UI, getThemeColors } from '../../src/ui/design';
import InteractivePressable from '../../components/ui/InteractivePressable';
import Reveal from '../../components/ui/Reveal';
import { notifyError, notifySuccess } from '../../src/ui/feedback';
import SkeletonCard from '../../components/ui/SkeletonCard';
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
  if (finalUrl.startsWith('/') && API_ORIGIN) {
    finalUrl = `${API_ORIGIN}${finalUrl}`;
  }
  if ((finalUrl.includes('localhost') || finalUrl.includes('127.0.0.1')) && API_ORIGIN) {
    try {
      const parsed = new URL(finalUrl);
      finalUrl = `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
    } catch {
      // noop: giữ nguyên finalUrl nếu parse thất bại
    }
  }
  const timestamp = new Date().getTime();
  return `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
};

type Trainer = {
  id: string | number;
  name: string;
  spec: string;
  rating: number;
  exp: string;
  price: number;
  availability: string;
  image_url: string;
};

const TIME_SLOTS: any = {
  'Sáng': ['06:00', '07:30', '09:00', '10:30'],
  'Chiều': ['13:30', '15:00', '16:30'],
  'Tối': ['18:00', '19:30', '21:00'],
};


function TrainerBookingForm({
  trainer,
  onClose,
  member,
  colors,
  isDark,
}: {
  trainer: Trainer;
  onClose: () => void;
  member?: any;
  colors: ReturnType<typeof getThemeColors>;
  isDark: boolean;
}) {
  const { addToCart, cart } = useCart(); 
  const { user } = useAuth(); 
  const webInputRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 390;

  
  const getMinimumDate = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 22) {
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return now;
  };

  const [date, setDate] = useState(getMinimumDate());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const availableShifts = trainer.availability ? trainer.availability.split(', ').map((s: string) => s.trim()) : [];

  const formatDateVN = (d: Date) => {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatLocalInputDate = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onChangeDateMobile = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) setDate(selectedDate);
    if (Platform.OS === 'android') setShowPicker(false);
  };

  const normalizeTimeToDate = (baseDate: Date, time: string) => {
    const [hour, minute] = time.split(':').map((v: string) => parseInt(v, 10));
    const d = new Date(baseDate);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const isTimeDisabled = (time: string) => {
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    if (!sameDay) return false;
    const dt = normalizeTimeToDate(date, time);
    return dt <= now;
  };

  const handleSelectTime = (time: string) => {
    if (isTimeDisabled(time)) return;
    setSelectedTime(time);
  };

  const handleBooking = async () => {
    if (!selectedShift || !selectedTime) {
      notifyError();
      Alert.alert("Thiếu thông tin", "Vui lòng chọn đầy đủ Ca và Giờ tập.");
      return;
    }
    
    const dateString = formatDateVN(date);
    const scheduleInfo = `${dateString} | ${selectedTime} (${selectedShift})`;

    
    const isConflict = cart.some(item => 
      item.type === 'trainer' && item.schedule === scheduleInfo
    );

    if (isConflict) {
      notifyError();
      Alert.alert(
        "Trùng lịch tập!", 
        `Bạn đã có một lịch thuê HLV khác vào lúc ${selectedTime} ngày ${dateString}. Vui lòng chọn giờ khác.`
      );
      return; 
    }

    
    const userId = member?.id || user?.id;
    if (userId) {
      try {
        console.log('🏋️ Checking trainer conflict for user:', userId, 'trainer:', trainer.id, 'schedule:', scheduleInfo);
        const checkRes = await api.post('/member/check-conflict', {
          member_id: userId,
          type: 'trainer',
          item_id: trainer.id,
          schedule: scheduleInfo,
        });
        
        console.log('✅ Trainer conflict check response:', checkRes.data);
        
        if (checkRes.data && checkRes.data.conflict === true) {
          console.log('⚠️ Trainer conflict found!', checkRes.data.message);
          notifyError();
          setErrorMessage(checkRes.data.message || 'Bạn đã có lịch với HLV này rồi.');
          return;
        }
      } catch (error: any) {
        console.error('❌ Error checking trainer conflict:', error.response?.data || error.message);
        
      }
    }    addToCart({
      id: trainer.id,
      name: `HLV ${trainer.name}`,
      price: Number(trainer.price),
      type: 'trainer',
      schedule: scheduleInfo,
      bookedForMember: !!member,
      memberId: member?.id,
      memberName: member?.name,
      memberEmail: member?.email,
    });
    notifySuccess();

    Alert.alert(
      "Thành công", 
      member ? `Đã thêm lịch thuê HLV ${trainer.name} cho ${member.name} vào giỏ hàng!` : `Đã thêm lịch thuê HLV ${trainer.name} vào giỏ hàng!`
    );
    onClose();
  };

  return (
     <View style={[styles.sheetContainer, { backgroundColor: colors.surface }, isSmallPhone && { padding: 16, paddingBottom: 24 }]}>
      <View style={styles.modalHeader}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>Đặt lịch tập</Text>
        <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.surfaceMuted }]}>
            <Feather name="x" size={24} color="#64748b" />
         </Pressable>
      </View>

      {errorMessage ? (
        <View style={{ backgroundColor: isDark ? '#3b1d1f' : '#fee2e2', padding: 12, marginBottom: 12, borderRadius: 4 }}>
          <Text style={{ color: colors.danger, fontSize: 14 }}>{errorMessage}</Text>
        </View>
      ) : null}

      <Text style={[styles.trainerNameLabel, { color: colors.primary }]}>HLV: {trainer.name}</Text>

      {}
      <Text style={[styles.label, { color: colors.text }]}>1. Chọn ngày:</Text>
      {Platform.OS === 'web' ? (
        <Pressable style={[styles.datePickerPlaceholder, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]} onPress={() => webInputRef.current?.showPicker?.()}>
          <View style={styles.datePickerRow}>
            <Feather name="calendar" size={20} color="#2563eb" style={{ marginRight: 10 }} />
            <input
              ref={webInputRef}
              type="date"
              value={formatLocalInputDate(date)}
              min={formatLocalInputDate(getMinimumDate())}
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: 16, fontFamily: 'System', backgroundColor: 'transparent', color: colors.text, cursor: 'pointer' }}
              onChange={(e) => { if (e.target.value) setDate(new Date(e.target.value)); }}
            />
          </View>
        </Pressable>
      ) : (
        <>
          <Pressable style={[styles.datePickerPlaceholder, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]} onPress={() => setShowPicker(true)}>
             <Feather name="calendar" size={20} color="#2563eb" style={{ marginRight: 10 }} />
             <Text style={[styles.dateText, { color: colors.text }]}>{formatDateVN(date)}</Text>
             <Feather name="chevron-down" size={20} color="#64748b" />
          </Pressable>
          {showPicker && (
            <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onChangeDateMobile} minimumDate={getMinimumDate()} />
          )}
        </>
      )}

      {}
      <Text style={[styles.label, { color: colors.text }]}>2. Chọn ca rảnh:</Text>
      <View style={styles.row}>
        {availableShifts.map((shift: string) => (
          <Pressable
            key={shift}
            style={[styles.chip, selectedShift === shift && styles.chipSelected]}
            onPress={() => { setSelectedShift(shift); setSelectedTime(''); }}
          >
            <Text style={[styles.chipText, { color: colors.textMuted }, selectedShift === shift && { color: '#fff' }]}>{shift}</Text>
          </Pressable>
        ))}
      </View>

      {}
      {selectedShift && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>3. Chọn giờ ({selectedShift}):</Text>
          <View style={styles.row}>
            {TIME_SLOTS[selectedShift].map((time: string) => {
              const disabled = isTimeDisabled(time);
              return (
                <Pressable
                  key={time}
                  disabled={disabled}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.chipSelected,
                    { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                    disabled && { opacity: 0.4 }
                  ]}
                  onPress={() => handleSelectTime(time)}
                >
                  <Text style={[styles.chipText, { color: colors.textMuted }, selectedTime === time && { color: '#fff' }]}>{time}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <View style={{ marginTop: 30 }}>
        <InteractivePressable
          style={styles.btnActionConfirm}
          pressedStyle={{ opacity: 0.92 }}
          haptic="light"
          onPress={handleBooking}>
          <Text style={styles.btnActionText}>Xác nhận đặt lịch</Text>
          <Feather name="arrow-right" size={20} color="white" style={{marginLeft: 8}} />
        </InteractivePressable>
      </View>
    </View>
  );
}


export default function TrainersPage() {
  const router = useRouter();
  const { cart } = useCart(); 
  const { user } = useAuth();
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { width, height } = useWindowDimensions();
  const isSmallPhone = width < 390;
  const isCompact = width < 360;

  const isAdmin = user?.role === 'admin';

  const handleOpenBooking = (trainer: Trainer) => {
    
    const isAlreadyInCart = cart.some(item => item.id === trainer.id && item.type === 'trainer');
    
    if (isAlreadyInCart) {
      notifyError();
      Alert.alert("Đã chọn", "Bạn đã thêm HLV này vào giỏ hàng rồi. Vui lòng vào giỏ hàng để kiểm tra hoặc thanh toán.");
      return;
    }

    setSelectedTrainer(trainer);
    if (isAdmin) {
      setMemberModalVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const fetchTrainers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainers');
      setTrainers(res.data);

      if (isAdmin) {
        const membersRes = await api.get('/admin/data');
        if (membersRes.data?.members) {
          setMembers(membersRes.data.members);
        }
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [isAdmin]);

  useFocusEffect(
    useCallback(() => {
      fetchTrainers();
    }, [fetchTrainers])
  );

  const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  const filteredTrainers = trainers.filter((trainer) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      (trainer.name || '').toLowerCase().includes(query) ||
      (trainer.spec || '').toLowerCase().includes(query) ||
      (trainer.availability || '').toLowerCase().includes(query)
    );
  });

  const renderTrainerItem = ({ item, index }: { item: Trainer; index: number }) => {
    
    const isAdded = cart.some(c => c.id === item.id && c.type === 'trainer');

    return (
      <Reveal delay={Math.min(index * 36, 260)}>
      <View style={[styles.card, isCompact && styles.cardCompact, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardContent}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: getSmartImageUrl(item.image_url) || 'https://via.placeholder.com/150' }}
              style={styles.avatarImage}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text style={[styles.name, isCompact && styles.nameCompact, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.specialty, isCompact && styles.specialtyCompact, { color: colors.textMuted }]}>{item.spec}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#eab308" />
              <Text style={[styles.ratingText, isCompact && styles.ratingTextCompact]}>{item.rating}</Text>
              <Text style={[styles.experience, isCompact && styles.experienceCompact, { color: colors.textMuted }]}>• {item.exp}</Text>
            </View>
            <Text style={[styles.price, isCompact && styles.priceCompact, { color: colors.primary }]}>{formatCurrency(Number(item.price))}/buổi</Text>
            <View style={styles.availabilityRow}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#6b7280" />
              <Text style={[styles.availabilityText, isCompact && styles.availabilityTextCompact, { color: colors.textMuted }]}>Có sẵn: {item.availability}</Text>
            </View>
          </View>
        </View>
        
        {}
        <InteractivePressable
          style={[styles.selectButton, isAdded && styles.buttonDisabled]}
          pressedStyle={{ opacity: 0.9 }}
          scaleTo={0.98}
          haptic="light"
          onPress={() => handleOpenBooking(item)}
          disabled={isAdded} 
        >
          {isAdded ? (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
               <Feather name="check" size={18} color="#fff" />
               <Text style={[styles.selectButtonText, isCompact && styles.selectButtonTextCompact]}>Đã chọn</Text>
            </View>
          ) : (
             <Text style={[styles.selectButtonText, isCompact && styles.selectButtonTextCompact]}>Chọn HLV này</Text>
          )}
        </InteractivePressable>
      </View>
      </Reveal>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      
      <View style={[styles.headerContainer, isCompact && styles.headerContainerCompact]}>
        <Text style={[styles.pageTitle, isCompact && styles.pageTitleCompact, { color: colors.text }]}>Huấn luyện viên</Text>
        <Text style={[styles.pageDesc, isCompact && styles.pageDescCompact, { color: colors.textMuted }]}>Chọn HLV phù hợp để tập luyện</Text>

        <View style={{ width: '100%', maxWidth: 600, marginTop: 12 }}>
          <TextInput
            style={[styles.searchInput, { borderColor: colors.border, backgroundColor: colors.surfaceMuted, color: colors.text }]}
            placeholder="Tìm theo tên, chuyên môn, thời gian..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {loading ? (
        <View style={[styles.listContent, isCompact && styles.listContentCompact]}>
          {[0, 1, 2].map((item) => (
            <SkeletonCard key={item} variant="trainer" />
          ))}
        </View>
      ) : (
        trainers.length > 0 ? (
          <FlatList
            data={filteredTrainers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTrainerItem}
            contentContainerStyle={[styles.listContent, isCompact && styles.listContentCompact]}
          />
        ) : (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="account-off-outline" size={60} color="#cbd5e1" style={{marginBottom: 10}} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Chưa có huấn luyện viên nào.</Text>
            <InteractivePressable
              style={styles.emptyCta}
              haptic="light"
              onPress={() => router.push('/memberships')}>
              <Text style={styles.emptyCtaText}>Khám phá gói thành viên</Text>
            </InteractivePressable>
          </View>
        )
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={{flex: 1}} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalContent, { maxHeight: height * 0.92, backgroundColor: colors.surface }] }>
            {selectedTrainer && (
              <TrainerBookingForm
                trainer={selectedTrainer}
                member={selectedMember}
                colors={colors}
                isDark={isDark}
                onClose={() => setModalVisible(false)}
              />
            )}
          </View>
        </View>
      </Modal>

      {}
      <Modal visible={memberModalVisible} animationType="fade" transparent={true} onRequestClose={() => setMemberModalVisible(false)}>
        <View style={styles.memberModalOverlay}>
          <View
            style={[
              styles.memberModalContent,
              {
                maxWidth: Math.min(500, width - 20),
                maxHeight: height * 0.85,
                padding: isSmallPhone ? 16 : 24,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Text style={[styles.memberModalTitle, { color: colors.text }]}>Chọn khách hàng</Text>
            <Text style={[styles.memberModalSubtitle, { color: colors.textMuted }]}>Đặt HLV: {selectedTrainer?.name}</Text>

            <TextInput 
              style={[styles.memberSearchInput, { borderColor: colors.border, backgroundColor: colors.surfaceMuted, color: colors.text }]}
              placeholder="Tìm theo tên hoặc email..."
              value={memberSearch}
              onChangeText={setMemberSearch}
              placeholderTextColor={colors.textMuted}
            />

            <ScrollView style={[styles.memberList, { maxHeight: Math.min(320, height * 0.45) }]}>
              {members
                .filter(m => m.name?.toLowerCase().includes(memberSearch.toLowerCase()) || m.email?.toLowerCase().includes(memberSearch.toLowerCase()))
                .map((member: any) => (
                  <Pressable 
                    key={member.id}
                    onPress={() => {
                      setSelectedMember(member);
                      setMemberModalVisible(false);
                      setModalVisible(true);
                    }}
                    style={({ pressed }) => [
                      styles.memberItem,
                      { backgroundColor: colors.surfaceMuted, borderBottomColor: colors.border },
                      pressed && { backgroundColor: isDark ? '#2d3748' : '#f0f4ff' },
                    ]}
                  >
                    <View>
                      <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                      <Text style={[styles.memberEmail, { color: colors.textMuted }]}>{member.email}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
                  </Pressable>
                ))}
            </ScrollView>

            <Pressable 
              style={({ pressed }) => [
                styles.memberCloseButton,
                { backgroundColor: colors.surfaceMuted },
                pressed && { backgroundColor: isDark ? '#374151' : '#e2e8f0' },
              ]}
              onPress={() => setMemberModalVisible(false)}
            >
              <Text style={[styles.memberCloseButtonText, { color: colors.textMuted }]}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.colors.bg },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headerContainerCompact: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: UI.colors.text,
    marginBottom: 4,
    textAlign: 'left',
    fontFamily: UI.font.heading,
  },
  pageTitleCompact: {
    fontSize: 24,
  },
  pageDesc: {
    fontSize: 14,
    color: UI.colors.textMuted,
    textAlign: 'left',
    fontFamily: UI.font.body,
  },
  pageDescCompact: {
    fontSize: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: UI.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: UI.font.body,
  },
  listContent: { paddingHorizontal: 8, paddingTop: 16, paddingBottom: 40, width: '100%', maxWidth: 600, alignSelf: 'center' },
  listContentCompact: { paddingHorizontal: 4 },
  card: { 
    backgroundColor: UI.colors.surface, 
    borderRadius: UI.radius.lg, 
    padding: 16, 
    marginBottom: 18, 
    flex: 1, 
    minWidth: 0,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: UI.colors.border,
    ...UI.shadow.card,
    marginHorizontal: 6,
  },
  cardCompact: {
    padding: 12,
    marginHorizontal: 2,
    marginBottom: 14,
  },
  cardContent: { flexDirection: 'row', marginBottom: 16 },
  avatarContainer: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#e8f5f2',
    borderWidth: 2,
    borderColor: UI.colors.border,
    shadowColor: UI.colors.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: UI.colors.text, fontFamily: UI.font.heading },
  nameCompact: { fontSize: 16 },
  specialty: { fontSize: 14, color: UI.colors.textMuted, marginBottom: 6, fontFamily: UI.font.body },
  specialtyCompact: { fontSize: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '700', marginLeft: 4, marginRight: 6, fontFamily: UI.font.body },
  ratingTextCompact: { fontSize: 12 },
  experience: { fontSize: 13, color: UI.colors.textMuted, fontFamily: UI.font.body },
  experienceCompact: { fontSize: 11 },
  price: { fontSize: 17, fontWeight: '700', color: UI.colors.primary, marginVertical: 4, fontFamily: UI.font.heading },
  priceCompact: { fontSize: 15 },
  availabilityRow: { flexDirection: 'row', alignItems: 'center' },
  availabilityText: { fontSize: 13, color: UI.colors.textMuted, marginLeft: 4, fontFamily: UI.font.body },
  availabilityTextCompact: { fontSize: 11 },
  
  selectButton: { backgroundColor: UI.colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, width: '100%' },
    emptyText: { color: UI.colors.textMuted, fontSize: 16, marginTop: 6, fontFamily: UI.font.body },
  emptyCta: {
    marginTop: 14,
    backgroundColor: UI.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyCtaText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: UI.font.heading,
  },
  selectButtonText: { color: '#fff', fontWeight: '700', fontFamily: UI.font.heading },
  selectButtonTextCompact: { fontSize: 12 },
  
  buttonDisabled: { backgroundColor: '#94a3b8' }, 
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 26, borderTopRightRadius: 26, maxHeight: '90%', width: '100%' },
  sheetContainer: { padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: UI.colors.text, fontFamily: UI.font.heading },
  closeButton: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 50 },
  trainerNameLabel: { fontSize: 16, color: UI.colors.primary, fontWeight: '700', marginBottom: 20, fontFamily: UI.font.body },
  label: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 12, marginTop: 8, fontFamily: UI.font.body },
  datePickerPlaceholder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: UI.colors.border, borderRadius: 12, padding: 16, backgroundColor: '#f8fafc' },
  datePickerRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dateText: { fontSize: 16, color: UI.colors.text, flex: 1, fontWeight: '600', fontFamily: UI.font.body },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 30, backgroundColor: '#fff', borderWidth: 2, borderColor: UI.colors.border, flexDirection: 'row', alignItems: 'center' },
  timeSlot: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1' },
  chipSelected: { backgroundColor: UI.colors.primary, borderColor: UI.colors.primary, shadowColor: UI.colors.primary, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  chipText: { color: '#64748b', fontWeight: '600', fontSize: 14, fontFamily: UI.font.body },
  btnActionConfirm: { backgroundColor: UI.colors.primary, padding: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: UI.colors.primary, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  btnActionText: { color: '#fff', fontWeight: '700', fontSize: 16, fontFamily: UI.font.heading },
  
  memberModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 10 },
  memberModalContent: { backgroundColor: '#fff', borderRadius: 16, width: '100%' },
  memberModalTitle: { fontSize: 22, fontWeight: '700', color: UI.colors.text, marginBottom: 4, fontFamily: UI.font.heading },
  memberModalSubtitle: { fontSize: 14, color: UI.colors.textMuted, marginBottom: 16, fontFamily: UI.font.body },
  memberSearchInput: { borderWidth: 1, borderColor: UI.colors.border, borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 16, fontFamily: UI.font.body },
  memberList: { maxHeight: 300, marginBottom: 16 },
  memberItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', borderRadius: 8, marginBottom: 8, backgroundColor: '#f9fafc' },
  memberName: { fontSize: 15, fontWeight: '600', color: UI.colors.text, fontFamily: UI.font.body },
  memberEmail: { fontSize: 13, color: UI.colors.textMuted, marginTop: 2, fontFamily: UI.font.body },
  memberCloseButton: { backgroundColor: '#f1f5f9', borderRadius: 8, padding: 12, alignItems: 'center' },
  memberCloseButtonText: { fontSize: 15, fontWeight: '600', color: UI.colors.textMuted, fontFamily: UI.font.body },
});

