import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../src/api/client';
import { useAuth } from '../../src/api/context/AuthContext';
import { useThemeMode } from '../../src/ui/theme-mode';


const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }
};

export default function TrainerBookings() {
  const { isDark } = useThemeMode();
  const [bookings, setBookings] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [rejectedBookings, setRejectedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { isInitializing } = useAuth();

  const fetchBookings = useCallback(async () => {
    if (isInitializing) {
      console.log('⏳ Đang khởi tạo auth, chờ...');
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/bookings/pending');
      console.log('✅ Got bookings:', res.data);
      setBookings(res.data);
    } catch (error: any) {
      console.error('❌ Lỗi tải booking:', error.response?.data || error.message);
      Alert.alert('Lỗi', 'Không thể tải danh sách đặt lịch');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isInitializing]);

  const fetchSchedule = useCallback(async () => {
    if (isInitializing) return;
    try {
      const res = await api.get('/bookings/trainer-schedule');
      setSchedule(res.data || []);
    } catch (error: any) {
      console.error('❌ Lỗi tải lịch dạy:', error.response?.data || error.message);
    }
  }, [isInitializing]);

  const fetchRejectedBookings = useCallback(async () => {
    if (isInitializing) return;
    try {
      const res = await api.get('/bookings/rejected');
      setRejectedBookings(res.data || []);
    } catch (error: any) {
      console.error('❌ Lỗi tải lịch bị từ chối:', error.response?.data || error.message);
    }
  }, [isInitializing]);

  useEffect(() => {
    console.log('🔄 useEffect triggered, isInitializing:', isInitializing);
    if (!isInitializing) {
      fetchBookings();
      fetchSchedule();
      fetchRejectedBookings();
    }
  }, [isInitializing, fetchBookings, fetchSchedule, fetchRejectedBookings]);

  useFocusEffect(
    useCallback(() => {
      if (!isInitializing) {
        fetchBookings();
        fetchSchedule();
        fetchRejectedBookings();
      }
    }, [isInitializing, fetchBookings, fetchSchedule, fetchRejectedBookings])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
    fetchSchedule();
    fetchRejectedBookings();
  };

  const handleConfirm = async (bookingId: number, action: 'confirm' | 'reject') => {
    try {
      setConfirming(true);
      console.log('🔄 Gửi xác nhận:', { booking_id: bookingId, action });
      const res = await api.post('/bookings/confirm', {
        booking_id: bookingId,
        action: action
      });

      console.log('✅ Response:', res.data);

      if (res.data.success) {
        
        setBookings(prev => prev.filter((b: any) => b.id !== bookingId));
        fetchSchedule();
        fetchRejectedBookings();

        
        showAlert(
          'Thành công', 
          action === 'confirm' ? 'Đã xác nhận đặt lịch' : 'Đã từ chối đặt lịch'
        );
      } else if (res.status === 409) {
        
        showAlert('Bị trùng lịch', res.data.message || 'Lịch này đã bị trùng, không thể nhận.');
      } else {
        showAlert('Lỗi', res.data.message || 'Không thể xử lý yêu cầu');
      }
    } catch (error: any) {
      console.error('❌ Lỗi xác nhận:', error.response?.data || error.message);
      console.log('❌ Status:', error.response?.status);
      
      const msg = error.response?.data?.message;
      const status = error.response?.status;
      
      if (status === 409) {
        showAlert('Bị trùng lịch', msg || 'Lịch này đã bị trùng, không thể nhận.');
      } else {
        showAlert('Lỗi', msg || 'Không thể xử lý yêu cầu');
      }
    } finally {
      setConfirming(false);
    }
  };

  const confirmAction = (bookingId: number, action: 'confirm' | 'reject', userName: string) => {
    console.log('🖱️ confirmAction click:', { bookingId, action, userName, platform: Platform.OS });

    
    if (Platform.OS === 'web') {
      const confirmMsg = `Bạn có chắc muốn ${action === 'confirm' ? 'xác nhận' : 'từ chối'} lịch hẹn của ${userName}?`;
      if (window.confirm(confirmMsg)) {
        handleConfirm(bookingId, action);
      }
      return;
    }

    Alert.alert(
      action === 'confirm' ? 'Xác nhận đặt lịch?' : 'Từ chối đặt lịch?',
      `Bạn có chắc muốn ${action === 'confirm' ? 'xác nhận' : 'từ chối'} lịch hẹn của ${userName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: action === 'confirm' ? 'Xác nhận' : 'Từ chối', 
          style: action === 'confirm' ? 'default' : 'destructive',
          onPress: () => handleConfirm(bookingId, action)
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#3b82f6" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Xác nhận lịch hẹn</Text>
          <Text style={styles.subtitle}>Danh sách học viên chờ xác nhận</Text>
        </View>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-check" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Không có lịch hẹn nào chờ xác nhận</Text>
          </View>
        ) : (
          bookings.map((booking: any) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.userInfo}>
                  <MaterialCommunityIcons name="account-circle" size={40} color="#3b82f6" />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{booking.user_name}</Text>
                    <Text style={styles.userContact}>{booking.user_email}</Text>
                    {booking.user_phone && (
                      <Text style={styles.userContact}>📞 {booking.user_phone}</Text>
                    )}
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isDark ? '#713f12' : '#fef3c7' }]}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={isDark ? '#fbbf24' : '#f59e0b'} />
                  <Text style={[styles.statusText, { color: isDark ? '#fbbf24' : '#f59e0b' }]}>Chờ xác nhận</Text>
                </View>
              </View>

              <View style={styles.scheduleInfo}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color="#64748b" />
                <Text style={styles.scheduleText}>{booking.schedule_info}</Text>
              </View>

              <View style={styles.timeInfo}>
                <MaterialCommunityIcons name="clock-time-four-outline" size={16} color="#94a3b8" />
                <Text style={styles.timeText}>
                  Đặt lúc: {new Date(booking.created_at).toLocaleString('vi-VN')}
                </Text>
              </View>

              <View style={styles.actions}>
                <Pressable
                  disabled={confirming}
                  style={({ pressed }) => [
                    styles.rejectButton,
                    confirming && { opacity: 0.5 },
                    pressed && !confirming && { opacity: 0.8 }
                  ]}
                  onPress={() => confirmAction(booking.id, 'reject', booking.user_name)}
                >
                  <MaterialCommunityIcons name="close-circle" size={20} color="white" />
                  <Text style={styles.buttonText}>{confirming ? 'Đang xử lý...' : 'Từ chối'}</Text>
                </Pressable>

                <Pressable
                  disabled={confirming}
                  style={({ pressed }) => [
                    styles.confirmButton,
                    confirming && { opacity: 0.5 },
                    pressed && !confirming && { opacity: 0.8 }
                  ]}
                  onPress={() => confirmAction(booking.id, 'confirm', booking.user_name)}
                >
                  <MaterialCommunityIcons name="check-circle" size={20} color="white" />
                  <Text style={styles.buttonText}>{confirming ? 'Đang xử lý...' : 'Xác nhận'}</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <MaterialCommunityIcons name="calendar-multiselect" size={22} color="#0ea5e9" />
            <Text style={styles.scheduleTitle}>Lịch dạy đã nhận</Text>
          </View>
          {schedule.length === 0 ? (
            <Text style={[styles.emptyText, { textAlign: 'left', marginTop: 0 }]}>Chưa có lịch dạy nào được nhận</Text>
          ) : (
            schedule.map((item: any) => (
              <View key={item.id} style={styles.scheduleItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduleInfoText}>{item.schedule_info}</Text>
                  <Text style={styles.scheduleUser}>Học viên: {item.user_name}</Text>
                </View>
                <Text style={styles.scheduleTime}>Đặt lúc: {new Date(item.created_at).toLocaleString('vi-VN')}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <MaterialCommunityIcons name="calendar-remove" size={22} color="#ef4444" />
            <Text style={styles.scheduleTitle}>Lịch sử các buổi bị hủy</Text>
          </View>
          {rejectedBookings.length === 0 ? (
            <Text style={[styles.emptyText, { textAlign: 'left', marginTop: 0 }]}>Chưa có buổi nào bị từ chối</Text>
          ) : (
            rejectedBookings.map((item: any) => (
              <View key={item.id} style={styles.scheduleItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduleInfoText}>{item.schedule_info}</Text>
                  <Text style={styles.scheduleUser}>Học viên: {item.user_name}</Text>
                </View>
                <Text style={[styles.scheduleTime, { color: '#ef4444' }]}>Đã từ chối</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  userContact: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 15,
    color: '#334155',
    flex: 1,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  timeText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: 8,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#22c55e',
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  scheduleSection: {
    marginTop: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  scheduleItem: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 4,
  },
  scheduleInfoText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  scheduleUser: {
    fontSize: 13,
    color: '#64748b',
  },
  scheduleTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
});


