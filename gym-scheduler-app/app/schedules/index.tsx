import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { api } from '../../src/api/client';

import { useCart } from '../../src/api/context/CartContext';

import { useAuth } from '../../src/api/context/AuthContext';
import { UI, getThemeColors } from '../../src/ui/design';
import InteractivePressable from '../../components/ui/InteractivePressable';
import Reveal from '../../components/ui/Reveal';
import { notifyError, notifySuccess } from '../../src/ui/feedback';
import SkeletonCard from '../../components/ui/SkeletonCard';
import { useThemeMode } from '../../src/ui/theme-mode';


type GymClass = {
  id: number;
  name: string;          
  time: string;          
  duration: number;      
  location: string;
  trainer_name: string;  
  days: string;
  price: number;         
  capacity: number;
  registered: number;
};

export default function ScheduleListPage() {
  const router = useRouter();
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const [schedules, setSchedules] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  
  const { addToCart, cart } = useCart();
  const { user, token, isInitializing } = useAuth();
  
  
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  
  
  const [daySelectionModalVisible, setDaySelectionModalVisible] = useState(false);
  const [selectedDaysForClass, setSelectedDaysForClass] = useState<string[]>([]);
  const [pendingClass, setPendingClass] = useState<GymClass | null>(null);
  const [pendingMember, setPendingMember] = useState<any>(null);
  
  const isAdmin = user?.role === 'admin';
  const isTrainer = user?.role === 'trainer';
  const trainerName = (user?.name || '').trim().toLowerCase();
  
  
  const filteredMembers = members
    .filter(m => m.role === 'member' || !m.role) 
    .filter(m => 
      m.name?.toLowerCase().includes(memberSearch.toLowerCase()) || 
      m.email?.toLowerCase().includes(memberSearch.toLowerCase())
    );

  const visibleSchedules = isTrainer
    ? schedules.filter((gymClass) => (gymClass.trainer_name || '').trim().toLowerCase() === trainerName)
    : schedules;

  
  const parseDays = (daysString: string): string[] => {
    if (!daysString) return [];
    return daysString.split(',').map(day => {
      day = day.trim().toLowerCase();
      
      if (day.startsWith('thứ ') || day.startsWith('chủ nhật')) {
        return day;
      }
      
      if (/^\d+$/.test(day)) {
        return day === '8' ? 'chủ nhật' : `thứ ${day}`;
      }
      
      const num = day.replace(/\s/g, '');
      if (/^\d+$/.test(num)) {
        return num === '8' ? 'chủ nhật' : `thứ ${num}`;
      }
      return day;
    });
  };

  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const fetchSchedules = useCallback(async () => {
    // Wait until auth restoration finishes, then fetch class list.
    if (isInitializing) {
      return;
    }

    const loadData = async () => {
      const res = await api.get('/gym-classes');
      if (res.data) {
        setSchedules(res.data);
      }

      if (isAdmin) {
        try {
          const membersRes = await api.get('/admin/data');
          if (membersRes.data?.members) {
            setMembers(membersRes.data.members);
          }
        } catch (adminDataError: any) {
          console.log('Admin data unavailable:', adminDataError?.response?.status, adminDataError?.message);
        }
      }
    };

    try {
      setLoading(true);
      await loadData();
      setErrorMessage('');
    } catch (e: any) {
      const status = e?.response?.status;
      const retryable = status === 401 || !e?.response || e?.message === 'Network Error';

      if (retryable) {
        try {
          await loadData();
          setErrorMessage('');
          return;
        } catch (retryError: any) {
          console.log('Lỗi retry tải API:', retryError?.response?.status, retryError?.message);
        }
      }

      console.log('Lỗi tải API:', status, e?.message);
      notifyError();
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isInitializing, token]);

  // Initial fetch when auth is ready and we have a token
  useEffect(() => {
    if (!isInitializing) {
      console.log('📡 Auth ready, fetching schedules...');
      fetchSchedules();
    }
  }, [isInitializing, fetchSchedules]);

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('👁️ Screen focused, refetching schedules...');
      if (!isInitializing) {
        fetchSchedules();
      }
    }, [isInitializing, fetchSchedules])
  );
  
  
  const handleBookForMember = async (member: any) => {
    if (!selectedClass) return;
    
    
    const availableDays = parseDays(selectedClass.days);
    if (availableDays.length > 1) {
      
      setPendingClass(selectedClass);
      setPendingMember(member);
      setMemberModalVisible(false);
      setDaySelectionModalVisible(true);
      return;
    }
    
    
    const selectedDay = availableDays[0] || selectedClass.days;
    await confirmBookingForMember(selectedClass, member, [selectedDay]);
  };

  
  const confirmBookingForMember = async (gymClass: GymClass, member: any, selectedDays: string[]) => {
    
    try {
      console.log('👤 Admin booking for member:', member.id, 'class:', gymClass.id);
      const checkRes = await api.post('/member/check-conflict', {
        member_id: member.id,
        type: 'class',
        item_id: gymClass.id,
      });
      
      console.log('✅ Admin conflict check response:', checkRes.data);
      
      if (checkRes.data && checkRes.data.conflict === true) {
        console.log('⚠️ Conflict found for member!', checkRes.data.message);
        notifyError();
        setErrorMessage(checkRes.data.message || 'Bạn đã có lịch này rồi.');
        setTimeout(() => setErrorMessage(''), 4000);
        setMemberModalVisible(false);
        setDaySelectionModalVisible(false);
        return;
      }
    } catch (error: any) {
      console.error('❌ Error checking conflict:', error.response?.data || error.message);
      
    }
    
    
    const schedules = selectedDays.map(day => `${day} | ${gymClass.time}`);
    
    
    addToCart({
      id: gymClass.id,
      name: gymClass.name,
      price: Number(gymClass.price), 
      type: 'class',
      schedule: schedules[0], 
      schedules: schedules, 
      quantity: selectedDays.length, 
      bookedForMember: true, 
      memberId: member.id,
      memberName: member.name,
      memberEmail: member.email,
    });

    
    setMemberModalVisible(false);
    setDaySelectionModalVisible(false);
    setSelectedClass(null);
    setPendingClass(null);
    setPendingMember(null);
    setSelectedDaysForClass([]);
    setMemberSearch('');
    notifySuccess();

    Alert.alert(
      'Thành công', 
      `Đã thêm "${gymClass.name}" (${selectedDays.join(', ')}) cho ${member.name} vào giỏ hàng.\n\nSau khi thanh toán, lịch tập sẽ được ghi nhận cho ${member.name}.`
    );
  };

  
  const handleAddToCart = async (item: GymClass) => {
    console.log('🔵 handleAddToCart called for:', item.name, 'days:', item.days);
    
    
    if (isAdmin) {
      setSelectedClass(item);
      setMemberModalVisible(true);
      return;
    }
    
    
    const availableDays = parseDays(item.days);
    console.log('📅 Parsed days:', availableDays);
    
    if (availableDays.length > 1) {
      
      console.log('📋 Showing day selection modal...');
      setPendingClass(item);
      setDaySelectionModalVisible(true);
      return;
    }
    
    
    const selectedDay = availableDays[0] || item.days;
    await confirmAddToCart(item, [selectedDay]);
  };

  
  const confirmAddToCart = async (item: GymClass, selectedDays: string[]) => {
    
    if (user?.id) {
      try {
        console.log('📍 Checking conflict for user:', user.id, 'class:', item.id);
        const checkRes = await api.post('/member/check-conflict', {
          member_id: user.id,
          type: 'class',
          item_id: item.id,
        });
        
        console.log('✅ Conflict check response:', checkRes.data);
        
        if (checkRes.data && checkRes.data.conflict === true) {
          console.log('⚠️ Conflict found!', checkRes.data.message);
          notifyError();
          setErrorMessage(checkRes.data.message || 'Bạn đã có lịch lớp này rồi.');
          setTimeout(() => setErrorMessage(''), 4000);
          setDaySelectionModalVisible(false);
          return;
        }
      } catch (error: any) {
        console.error('❌ Error checking conflict:', error.response?.data || error.message);
        
      }
    }
    
    
    const schedules = selectedDays.map(day => `${day} | ${item.time}`);
    
    
    addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price), 
      type: 'class',
      schedule: schedules[0], 
      schedules: schedules, 
      quantity: selectedDays.length, 
      bookedForMember: false, 
    });

    setDaySelectionModalVisible(false);
    setPendingClass(null);
    setSelectedDaysForClass([]);
    notifySuccess();

    const dayText = selectedDays.length === 1 ? selectedDays[0] : `${selectedDays.length} ngày`;
    Alert.alert(
      "Thành công",
      `Đã thêm lớp "${item.name}" (${dayText}) vào giỏ hàng!`,
      [
        { text: "Tiếp tục xem", style: "cancel" },
        { text: "Đến thanh toán", onPress: () => router.push('/checkout') }
      ]
    );
  };

  const renderScheduleItem = ({ item, index }: { item: GymClass; index: number }) => {
    const isFull = item.registered >= item.capacity;

    
    
    const isAdded = cart.some(
        (cartItem) => cartItem.id === item.id && cartItem.type === 'class'
    );

    return (
      <Reveal delay={Math.min(index * 36, 260)}>
      <View style={[styles.card, isCompact && styles.cardCompact, { backgroundColor: colors.surface, borderColor: colors.border }] }>
        <Text style={[styles.cardTitle, isCompact && styles.cardTitleCompact, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock-time-four-outline" size={16} color="#6b7280" />
          <Text style={[styles.infoText, isCompact && styles.infoTextCompact, { color: colors.text }]}>{item.time} ({item.duration} phút)</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={16} color="#6b7280" />
          <Text style={[styles.infoText, isCompact && styles.infoTextCompact, { color: colors.text }]}>{item.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account-group-outline" size={16} color="#6b7280" />
          <Text style={[styles.infoText, isCompact && styles.infoTextCompact, { color: colors.text }]}>
             {item.registered || 0}/{item.capacity} người
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Huấn luyện viên:</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{item.trainer_name}</Text> 
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Lịch:</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{item.days}</Text>
        </View>

        {}
        <Text style={[styles.price, isCompact && styles.priceCompact, { color: isFull ? colors.textMuted : colors.primary }]}>
            {isFull ? 'Hết chỗ' : `${formatCurrency(item.price)}/buổi`}
        </Text>

        {}
        {isTrainer ? (
          <View style={[styles.trainerTag, { backgroundColor: isDark ? '#134e4a' : '#ccfbf1' }]}>
            <MaterialCommunityIcons name="calendar-check" size={16} color={colors.primary} />
            <Text style={[styles.trainerTagText, { color: colors.primary }]}>Lớp của bạn</Text>
          </View>
        ) : (
          <InteractivePressable
            style={[styles.addButton, (isFull || isAdded) && styles.buttonDisabled]}
            pressedStyle={{ opacity: 0.9 }}
            haptic="light"
            scaleTo={0.98}
            onPress={() => {
              if (isAdded) {
                notifyError();
                  Alert.alert("Đã thêm", "Lớp học này đã có trong giỏ hàng của bạn.");
                  return;
              }
              if (isFull) {
                notifyError();
                  Alert.alert("Thông báo", "Lớp học này đã đủ số lượng học viên.");
                  return;
              }
              
              handleAddToCart(item);
            }}
            disabled={isFull || isAdded}
          >
            {}
            {isAdded ? (
               <Feather name="check" size={18} color="#fff" style={{ marginRight: 6 }} />
            ) : (
               <MaterialCommunityIcons 
                  name={isFull ? "account-off-outline" : "cart-plus"} 
                  size={18} 
                  color="#fff" 
                  style={{ marginRight: 6 }} 
               />
            )}
            
            {}
            <Text style={[styles.addButtonText, isCompact && styles.addButtonTextCompact]}>
              {isAdded ? 'Đã thêm' : (isFull ? 'Đã đầy lớp' : 'Thêm vào giỏ')}
            </Text>
          </InteractivePressable>
        )}
      </View>
      </Reveal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      
      <View style={[styles.headerContainer, isCompact && styles.headerContainerCompact]}>
        <Text style={[styles.pageTitle, isCompact && styles.pageTitleCompact, { color: colors.text }]}>{isTrainer ? 'Lớp của tôi' : 'Lịch tập lớp'}</Text>
        <Text style={[styles.pageDesc, isCompact && styles.pageDescCompact, { color: colors.textMuted }]}>{isTrainer ? 'Danh sách lớp bạn được phân công giảng dạy' : 'Chọn lớp học phù hợp với lịch trình của bạn'}</Text>
      </View>


      {errorMessage ? (
        <View style={{ backgroundColor: isDark ? '#3b1d1f' : '#fee2e2', padding: 12, marginBottom: 8 }}>
          <Text style={{ color: colors.danger, fontSize: 14 }}>{errorMessage}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={[styles.listContent, isCompact && styles.listContentCompact]}>
          {[0, 1, 2].map((item) => (
            <SkeletonCard key={item} variant="schedule" />
          ))}
        </View>
      ) : (
        <FlatList
          data={visibleSchedules}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderScheduleItem}
          contentContainerStyle={[styles.listContent, isCompact && styles.listContentCompact]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="calendar-remove-outline" size={60} color="#cbd5e1" style={{marginBottom: 10}} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>{isTrainer ? 'Bạn chưa được phân công lớp nào.' : 'Chưa có lớp học nào được mở.'}</Text>
              {!isTrainer && (
                <InteractivePressable
                  style={styles.emptyCta}
                  haptic="light"
                  onPress={() => router.push('/trainers')}>
                  <Text style={styles.emptyCtaText}>Xem danh sách huấn luyện viên</Text>
                </InteractivePressable>
              )}
            </View>
          }
        />
      )}
      
      {}
      <Modal visible={memberModalVisible} animationType="fade" transparent={true} onRequestClose={() => setMemberModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Chọn khách hàng</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>Đặt lịch: {selectedClass?.name}</Text>
            
            <TextInput 
              style={[styles.searchInput, { borderColor: colors.border, backgroundColor: colors.surfaceMuted, color: colors.text }]}
              placeholder="Tìm theo tên hoặc email..."
              value={memberSearch}
              onChangeText={setMemberSearch}
              placeholderTextColor={colors.textMuted}
            />
            
            {members.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Không có khách hàng nào</Text>
            ) : (
              <ScrollView style={styles.memberList}>
                {filteredMembers.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Không tìm thấy khách hàng</Text>
                ) : (
                  filteredMembers.map((member: any) => (
                    <Pressable 
                      key={member.id}
                      onPress={() => {
                        console.log('Selecting member:', member);
                        handleBookForMember(member);
                      }}
                      style={({ pressed }) => [
                        styles.memberItem,
                        { backgroundColor: colors.surfaceMuted, borderBottomColor: colors.border },
                        pressed && { backgroundColor: isDark ? '#2d3748' : '#f0f4ff' }
                      ]}
                    >
                      <View>
                        <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                        <Text style={[styles.memberEmail, { color: colors.textMuted }]}>{member.email}</Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
                    </Pressable>
                  ))
                )}
              </ScrollView>
            )}
            
            <Pressable 
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.surfaceMuted },
                pressed && { backgroundColor: isDark ? '#374151' : '#e2e8f0' }
              ]}
              onPress={() => setMemberModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.textMuted }]}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        visible={daySelectionModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setDaySelectionModalVisible(false);
          setPendingClass(null);
          setSelectedDaysForClass([]);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Chọn ngày tập</Text>
            {pendingClass && (
              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                {pendingClass.name} có nhiều ngày trong tuần. Vui lòng chọn ngày bạn muốn tham gia:
              </Text>
            )}
            
            <View style={{ marginTop: 16, gap: 12 }}>
              {pendingClass && parseDays(pendingClass.days).map((day) => (
                <Pressable
                  key={day}
                  style={[
                    styles.dayOption,
                    { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
                    selectedDaysForClass.includes(day) && styles.dayOptionActive
                  ]}
                  onPress={() => {
                    if (selectedDaysForClass.includes(day)) {
                      setSelectedDaysForClass(selectedDaysForClass.filter(d => d !== day));
                    } else {
                      setSelectedDaysForClass([...selectedDaysForClass, day]);
                    }
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.dayOptionText,
                      { color: colors.text },
                      selectedDaysForClass.includes(day) && styles.dayOptionTextActive
                    ]}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Text>
                    <Text style={[styles.dayOptionTime, { color: colors.textMuted }]}>{pendingClass.time}</Text>
                  </View>
                  {selectedDaysForClass.includes(day) && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <Pressable 
                style={[styles.closeButton, { flex: 1, backgroundColor: colors.surfaceMuted }]}
                onPress={() => {
                  setDaySelectionModalVisible(false);
                  setPendingClass(null);
                  setSelectedDaysForClass([]);
                  setPendingMember(null);
                }}
              >
                <Text style={[styles.closeButtonText, { color: colors.textMuted }]}>Hủy</Text>
              </Pressable>
              
              <Pressable 
                style={[
                  styles.confirmButton, 
                  { flex: 1 },
                  selectedDaysForClass.length === 0 && styles.confirmButtonDisabled
                ]}
                disabled={selectedDaysForClass.length === 0}
                onPress={() => {
                  console.log('📋 Confirming day selection:', selectedDaysForClass);
                  if (pendingClass && selectedDaysForClass.length > 0) {
                    if (pendingMember) {
                      console.log('👤 Confirming booking for member:', pendingMember.name);
                      confirmBookingForMember(pendingClass, pendingMember, selectedDaysForClass);
                    } else {
                      console.log('👤 Confirming add to cart for current user');
                      confirmAddToCart(pendingClass, selectedDaysForClass);
                    }
                  }
                }}
              >
                <Text style={[
                  styles.confirmButtonText,
                  selectedDaysForClass.length === 0 && styles.confirmButtonTextDisabled
                ]}>
                  Xác nhận ({selectedDaysForClass.length})
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.colors.bg,
  },
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
  listContent: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  listContentCompact: {
    paddingHorizontal: 4,
  },
  columnWrapper: {
    justifyContent: 'space-evenly',
    gap: 10,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: UI.colors.surface,
    borderRadius: UI.radius.lg,
    padding: 18,
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: UI.colors.border,
    marginHorizontal: 6,
    ...UI.shadow.card,
  },
  cardCompact: {
    padding: 14,
    marginHorizontal: 2,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    width: '100%',
  },
  emptyText: {
    color: UI.colors.textMuted,
    fontSize: 16,
    marginTop: 6,
    fontFamily: UI.font.body,
  },
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
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: UI.colors.text,
    marginBottom: 10,
    minHeight: 40,
    fontFamily: UI.font.heading,
  },
  cardTitleCompact: {
    fontSize: 15,
    minHeight: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  infoText: {
    fontSize: 13,
    color: '#334155',
    marginLeft: 6,
    flex: 1,
    fontFamily: UI.font.body,
  },
  infoTextCompact: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 10,
  },
  metaRow: {
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 11,
    color: UI.colors.textMuted,
    marginBottom: 2,
    fontFamily: UI.font.body,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: UI.colors.text,
    fontFamily: UI.font.body,
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: UI.colors.primary,
    marginTop: 10,
    marginBottom: 10,
    fontFamily: UI.font.heading,
  },
  priceCompact: {
    fontSize: 15,
  },
  addButton: {
    backgroundColor: UI.colors.primary,
    borderRadius: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  trainerTag: {
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  trainerTagText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: UI.font.heading,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: UI.font.heading,
  },
  addButtonTextCompact: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: UI.radius.lg,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: UI.colors.text,
    marginBottom: 4,
    fontFamily: UI.font.heading,
  },
  modalSubtitle: {
    fontSize: 14,
    color: UI.colors.textMuted,
    marginBottom: 16,
    fontFamily: UI.font.body,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: UI.colors.border,
    borderRadius: UI.radius.sm,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    fontFamily: UI.font.body,
  },
  memberList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    borderRadius: UI.radius.sm,
    marginBottom: 8,
    backgroundColor: '#f9fafc',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: UI.colors.text,
    fontFamily: UI.font.body,
  },
  memberEmail: {
    fontSize: 13,
    color: UI.colors.textMuted,
    marginTop: 2,
    fontFamily: UI.font.body,
  },
  closeButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: UI.radius.sm,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: UI.colors.textMuted,
    fontFamily: UI.font.body,
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: UI.radius.md,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: UI.colors.border,
  },
  dayOptionActive: {
    backgroundColor: '#ecfeff',
    borderColor: UI.colors.primary,
  },
  dayOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: UI.colors.text,
    fontFamily: UI.font.body,
  },
  dayOptionTextActive: {
    color: UI.colors.primary,
  },
  dayOptionTime: {
    fontSize: 13,
    color: UI.colors.textMuted,
    marginTop: 2,
    fontFamily: UI.font.body,
  },
  confirmButton: {
    backgroundColor: UI.colors.primary,
    borderRadius: UI.radius.sm,
    padding: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#cbd5e1',
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    fontFamily: UI.font.heading,
  },
  confirmButtonTextDisabled: {
    color: '#94a3b8',
  },
  pendingContainer: {
    display: 'none',
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginLeft: 8,
  },
  pendingDesc: {
    fontSize: 14,
    color: '#b45309',
    marginBottom: 12,
    lineHeight: 20,
  },
  checkoutButton: {
    backgroundColor: '#d97706',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: UI.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: UI.font.heading,
  },
});

