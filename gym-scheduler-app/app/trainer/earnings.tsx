import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTrainerManagement } from '../../src/hooks/useTrainerManagement';
import { useAuth } from '../../src/api/context/AuthContext';

const screenWidth = Dimensions.get('window').width;

export default function TrainerEarningsScreen() {
  const { trainerId } = useLocalSearchParams();
  const { user } = useAuth();
  const parsedTrainerId = typeof trainerId === 'string' ? parseInt(trainerId, 10) : NaN;
  const id = Number.isFinite(parsedTrainerId) ? parsedTrainerId : (user?.id ?? 0);

  const { 
    earnings, 
    withdrawalRequests,
    trainerSchedule,
    pendingBookings,
    rejectedBookings,
    loading, 
    fetchEarnings, 
    requestWithdrawal,
    fetchWithdrawalRequests,
    fetchTrainerSchedule,
    fetchPendingBookings,
    fetchRejectedBookings,
    checkInTrainerBooking,
  } = useTrainerManagement(id);

  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank_transfer' | 'wallet'>(
    'bank_transfer'
  );
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [checkingBookingId, setCheckingBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInFeedback, setCheckInFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const toSafeNumber = (value: unknown) => {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const formatVnd = (value: unknown) => `${Math.round(toSafeNumber(value)).toLocaleString('vi-VN')} đ`;

  const pendingCheckIns = trainerSchedule
    .filter((booking: any) => booking.status === 'confirmed')
    .sort((left: any, right: any) => {
      const leftTime = new Date(left.created_at || 0).getTime();
      const rightTime = new Date(right.created_at || 0).getTime();
      return rightTime - leftTime;
    });
  const completedCheckIns = trainerSchedule
    .filter((booking: any) => booking.status === 'completed')
    .sort((left: any, right: any) => {
      const leftTime = new Date(left.updated_at || left.created_at || 0).getTime();
      const rightTime = new Date(right.updated_at || right.created_at || 0).getTime();
      return rightTime - leftTime;
    });

  const getBookingAmount = (booking: any) => toSafeNumber(booking.trainer_price || booking.price || 0);

  const getPayoutAmount = (booking: any) => getBookingAmount(booking) * 0.6;

  const completedCheckInIncome = completedCheckIns.reduce(
    (sum: number, booking: any) => sum + getPayoutAmount(booking),
    0
  );

  const openCheckInModal = (booking: any) => {
    setSelectedBooking(booking);
    setCheckInFeedback({ type: null, message: '' });
    setShowCheckInModal(true);
  };

  const confirmCheckInBooking = async () => {
    if (!selectedBooking) {
      return;
    }

    setCheckingBookingId(selectedBooking.id);
    setCheckInFeedback({ type: null, message: '' });

    try {
      await checkInTrainerBooking(selectedBooking.id);
      setActiveTab('history');
      setShowCheckInModal(false);
      setSelectedBooking(null);
      setCheckInFeedback({
        type: 'success',
        message: 'Đã xác nhận check-in và cộng thu nhập bằng VND.',
      });
    } catch (err: any) {
      setCheckInFeedback({
        type: 'error',
        message: err.message || 'Không thể xác nhận check-in',
      });
    } finally {
      setCheckingBookingId(null);
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    fetchEarnings();
    fetchWithdrawalRequests();
    fetchTrainerSchedule();
    fetchPendingBookings();
    fetchRejectedBookings();
  }, [id, fetchEarnings, fetchWithdrawalRequests, fetchTrainerSchedule, fetchPendingBookings, fetchRejectedBookings]);

  useFocusEffect(
    React.useCallback(() => {
      if (id) {
        fetchEarnings();
        fetchWithdrawalRequests();
        fetchTrainerSchedule();
        fetchPendingBookings();
        fetchRejectedBookings();
      }
    }, [id, fetchEarnings, fetchWithdrawalRequests, fetchTrainerSchedule, fetchPendingBookings, fetchRejectedBookings])
  );

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Không xác định được trainer hiện tại.</Text>
      </View>
    );
  }

  const handleRequestWithdrawal = async () => {
    if (!withdrawalAmount) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền');
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    if (amount <= 0 || (earnings && amount > earnings.withdrawal_balance)) {
      Alert.alert('Lỗi', 'Số tiền không hợp lệ hoặc vượt quá số dư');
      return;
    }

    if (withdrawalMethod === 'bank_transfer' && (!accountNumber || !accountHolder || !bankName)) {
      Alert.alert('Lỗi', 'Vui lòng nhập thông tin ngân hàng');
      return;
    }

    try {
      await requestWithdrawal({
        amount,
        method: withdrawalMethod,
        bank_details:
          withdrawalMethod === 'bank_transfer'
            ? {
                account_number: accountNumber,
                account_holder: accountHolder,
                bank_name: bankName,
              }
            : undefined,
      });
      Alert.alert('Thành công', 'Yêu cầu rút tiền đã được gửi');
      setWithdrawalAmount('');
      setAccountNumber('');
      setAccountHolder('');
      setBankName('');
      setShowWithdrawalModal(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  if (!earnings) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  const completedSessions = toSafeNumber(earnings.completed_sessions);
  const cancelledSessions = toSafeNumber(earnings.cancelled_sessions);
  const pendingSessions = pendingBookings.length;
  const totalEarnings = toSafeNumber(earnings.total_earnings);
  const withdrawalBalance = toSafeNumber(earnings.withdrawal_balance);
  const commissionRate = toSafeNumber(earnings.commission_rate);
  const completionRate = Math.round(
    (completedSessions / Math.max(completedSessions + cancelledSessions, 1)) * 100
  );

  return (
    <ScrollView style={styles.container}>
      {/* Wallet Card */}
      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>Số dư có thể rút</Text>
        <Text style={styles.walletAmount}>{formatVnd(withdrawalBalance)}</Text>
        <TouchableOpacity
          style={styles.withdrawButton}
          onPress={() => setShowWithdrawalModal(true)}
        >
          <Text style={styles.withdrawButtonText}>Rút tiền</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.stat1]}>
          <Text style={styles.statLabel}>Tổng thu nhập</Text>
          <Text style={styles.statValue}>{formatVnd(totalEarnings)}</Text>
        </View>
        <View style={[styles.statCard, styles.stat2]}>
          <Text style={styles.statLabel}>Buổi hoàn tất</Text>
          <Text style={styles.statValue}>{completedSessions}</Text>
        </View>
        <View style={[styles.statCard, styles.stat3]}>
          <Text style={styles.statLabel}>Booking chờ xác nhận</Text>
          <Text style={styles.statValue}>{pendingSessions}</Text>
        </View>
        <View style={[styles.statCard, styles.stat4]}>
          <Text style={styles.statLabel}>Buổi bị hủy</Text>
          <Text style={styles.statValue}>{cancelledSessions}</Text>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsContainer}>
        <Text style={styles.sectionTitle}>Thống kê hiệu suất</Text>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Tỷ lệ hoàn tất</Text>
            <Text style={styles.metricValue}>{completionRate}%</Text>
          </View>
          <View style={styles.metricBar}>
            <View style={[styles.metricFill, { width: `${completionRate}%` }]} />
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Thu nhập trung bình/buổi</Text>
            <Text style={styles.metricValue}>
              {formatVnd(earnings.completed_sessions > 0 ? earnings.total_earnings / earnings.completed_sessions : 0)}
            </Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Đánh giá</Text>
            <Text style={styles.metricValue}>⭐ 4.8/5</Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Hoa hồng</Text>
            <Text style={styles.metricValue}>{commissionRate}%</Text>
          </View>
        </View>
      </View>

      {/* Commission Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Thông tin hoa hồng</Text>
        <Text style={styles.infoText}>
          Bạn nhận được 60% từ mỗi buổi tập thành công. Số dư rút tiền sẽ được cập nhật sau mỗi buổi.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Xác nhận check-in lịch dạy</Text>
        <Text style={styles.infoText}>
          Chuyển giữa lịch chờ check-in và lịch sử buổi đã hoàn thành để theo dõi thu nhập theo từng buổi.
        </Text>

        {checkInFeedback.type && (
          <View
            style={[
              styles.feedbackBanner,
              checkInFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
            ]}
          >
            <Text
              style={[
                styles.feedbackText,
                checkInFeedback.type === 'success' ? styles.feedbackTextSuccess : styles.feedbackTextError,
              ]}
            >
              {checkInFeedback.message}
            </Text>
          </View>
        )}

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'pending' && styles.tabButtonActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'pending' && styles.tabButtonTextActive]}>
              Chờ check-in
            </Text>
            <Text style={[styles.tabButtonCount, activeTab === 'pending' && styles.tabButtonCountActive]}>
              {pendingCheckIns.length}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'history' && styles.tabButtonTextActive]}>
              Lịch sử buổi
            </Text>
            <Text style={[styles.tabButtonCount, activeTab === 'history' && styles.tabButtonCountActive]}>
              {completedCheckIns.length + rejectedBookings.length}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'pending' ? (
          pendingCheckIns.length === 0 ? (
            <Text style={styles.emptyStateText}>Không có lịch chờ check-in.</Text>
          ) : (
            pendingCheckIns.map((booking: any) => {
              const sessionAmount = getBookingAmount(booking);
              const payoutAmount = getPayoutAmount(booking);

              return (
                <View key={booking.id} style={styles.checkInCard}>
                  <View style={styles.checkInRow}>
                    <Text style={styles.checkInTitle} numberOfLines={1}>
                      {booking.user_name || 'Khách hàng'}
                    </Text>
                    <Text style={styles.checkInBadge}>60%</Text>
                  </View>
                  <Text style={styles.checkInMeta} numberOfLines={2}>
                    {booking.schedule_info || 'Chưa có thông tin lịch'}
                  </Text>
                  <Text style={styles.checkInMeta}>
                    Giá buổi: {formatVnd(sessionAmount)} | Bạn nhận: {formatVnd(payoutAmount)}
                  </Text>
                  <TouchableOpacity
                    style={styles.checkInButton}
                    onPress={() => openCheckInModal(booking)}
                    disabled={loading || checkingBookingId === booking.id}
                  >
                    {checkingBookingId === booking.id ? (
                      <View style={styles.checkInButtonInner}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.checkInButtonText}>Đang xác nhận...</Text>
                      </View>
                    ) : (
                      <Text style={styles.checkInButtonText}>Xác nhận check-in</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          )
        ) : (
          <>
            <View style={styles.historySummaryCard}>
              <Text style={styles.historySummaryLabel}>Tổng thu nhập từ các buổi đã check-in</Text>
              <Text style={styles.historySummaryValue}>{formatVnd(completedCheckInIncome)}</Text>
              <Text style={styles.historySummaryMeta}>{completedCheckIns.length} buổi đã hoàn thành</Text>
            </View>

            <Text style={styles.historySectionLabel}>Lịch sử đã check-in</Text>
            {completedCheckIns.length === 0 ? (
              <Text style={styles.emptyStateText}>Chưa có buổi nào đã check-in.</Text>
            ) : (
              completedCheckIns.map((booking: any) => {
                const sessionAmount = getBookingAmount(booking);
                const payoutAmount = getPayoutAmount(booking);
                const completedAt = booking.updated_at || booking.created_at;

                return (
                  <View key={booking.id} style={styles.historyCard}>
                    <View style={styles.historyCardHeader}>
                      <Text style={styles.checkInTitle} numberOfLines={1}>
                        {booking.user_name || 'Khách hàng'}
                      </Text>
                      <Text style={styles.historyBadge}>Đã check-in</Text>
                    </View>
                    <Text style={styles.checkInMeta} numberOfLines={2}>
                      {booking.schedule_info || 'Chưa có thông tin lịch'}
                    </Text>
                    <Text style={styles.checkInMeta}>
                      Giá buổi: {formatVnd(sessionAmount)} | Thu nhập buổi: {formatVnd(payoutAmount)}
                    </Text>
                    <Text style={styles.historyDate}>
                      {completedAt ? `Hoàn thành lúc ${new Date(completedAt).toLocaleString('vi-VN')}` : 'Đã hoàn thành'}
                    </Text>
                  </View>
                );
              })
            )}

            <Text style={styles.historySectionLabel}>Lịch sử từ chối</Text>
            {rejectedBookings.length === 0 ? (
              <Text style={styles.emptyStateText}>Chưa có buổi nào bị từ chối.</Text>
            ) : (
              rejectedBookings.map((booking: any) => {
                const sessionAmount = getBookingAmount(booking);
                const rejectedAt = booking.updated_at || booking.created_at;

                return (
                  <View key={booking.id} style={styles.historyCard}>
                    <View style={styles.historyCardHeader}>
                      <Text style={styles.checkInTitle} numberOfLines={1}>
                        {booking.user_name || 'Khách hàng'}
                      </Text>
                      <Text style={styles.historyBadge}>Đã từ chối</Text>
                    </View>
                    <Text style={styles.checkInMeta} numberOfLines={2}>
                      {booking.schedule_info || 'Chưa có thông tin lịch'}
                    </Text>
                    <Text style={styles.checkInMeta}>
                      Giá buổi: {formatVnd(sessionAmount)} | Thu nhập buổi: 0 đ
                    </Text>
                    <Text style={styles.historyDate}>
                      {rejectedAt ? `Từ chối lúc ${new Date(rejectedAt).toLocaleString('vi-VN')}` : 'Đã từ chối'}
                    </Text>
                  </View>
                );
              })
            )}
          </>
        )}
      </View>

      {/* Withdrawal Modal */}
      <Modal visible={showWithdrawalModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yêu cầu rút tiền</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số tiền (VND)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={withdrawalAmount}
                onChangeText={setWithdrawalAmount}
                keyboardType="decimal-pad"
              />
              <Text style={styles.hint}>Số dư: {formatVnd(withdrawalBalance)}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phương thức rút tiền</Text>
              <View style={styles.methodButtons}>
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    withdrawalMethod === 'wallet' && styles.methodButtonActive,
                  ]}
                  onPress={() => setWithdrawalMethod('wallet')}
                >
                  <Text
                    style={[
                      styles.methodButtonText,
                      withdrawalMethod === 'wallet' && styles.methodButtonTextActive,
                    ]}
                  >
                    Ví điện tử
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    withdrawalMethod === 'bank_transfer' && styles.methodButtonActive,
                  ]}
                  onPress={() => setWithdrawalMethod('bank_transfer')}
                >
                  <Text
                    style={[
                      styles.methodButtonText,
                      withdrawalMethod === 'bank_transfer' && styles.methodButtonTextActive,
                    ]}
                  >
                    Chuyển khoản ngân hàng
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {withdrawalMethod === 'bank_transfer' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Số tài khoản"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tên chủ tài khoản"
                  value={accountHolder}
                  onChangeText={setAccountHolder}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Tên ngân hàng"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowWithdrawalModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleRequestWithdrawal}
              >
                <Text style={styles.buttonText}>Gửi yêu cầu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showCheckInModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.modalTitle}>Xác nhận check-in</Text>
            <Text style={styles.confirmModalText}>
              {selectedBooking
                ? `${selectedBooking.user_name || 'Khách hàng'} · ${selectedBooking.schedule_info || 'Chưa có thông tin lịch'}`
                : 'Chưa chọn buổi check-in'}
            </Text>
            <Text style={styles.confirmModalAmount}>
              Thu nhập dự kiến: {selectedBooking ? formatVnd(getPayoutAmount(selectedBooking)) : formatVnd(0)}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowCheckInModal(false);
                  setSelectedBooking(null);
                }}
                disabled={checkingBookingId !== null}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={confirmCheckInBooking}
                disabled={checkingBookingId !== null}
              >
                {checkingBookingId !== null ? (
                  <View style={styles.checkInButtonInner}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.buttonText}>Đang xác nhận...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdrawal Requests History */}
      <View style={styles.historySection}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Lịch sử yêu cầu rút tiền</Text>
          {loading && <ActivityIndicator size="small" color="#FF6B6B" />}
        </View>
        
        {withdrawalRequests && withdrawalRequests.length > 0 ? (
          <FlatList
            data={withdrawalRequests}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestAmount}>{formatVnd(item.amount || 0)}</Text>
                  <View
                    style={[
                      styles.requestStatusBadge,
                      {
                        backgroundColor:
                          item.status === 'approved'
                            ? '#E8F5E9'
                            : item.status === 'rejected'
                            ? '#FFEBEE'
                            : '#FFF3E0',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.requestStatus,
                        {
                          color:
                            item.status === 'approved'
                              ? '#2E7D32'
                              : item.status === 'rejected'
                              ? '#C62828'
                              : '#E65100',
                        },
                      ]}
                    >
                      {item.status === 'approved'
                        ? 'Đã duyệt'
                        : item.status === 'rejected'
                        ? 'Từ chối'
                        : item.status === 'processed'
                        ? 'Đã xử lý'
                        : 'Chờ duyệt'}
                    </Text>
                  </View>
                </View>
                <View style={styles.requestDetails}>
                  <Text style={styles.requestMethod}>
                    {item.method === 'bank_transfer' ? '💳 Chuyển khoản ngân hàng' : '📱 Ví điện tử'}
                  </Text>
                  <Text style={styles.requestDate}>
                    {new Date(item.created_at).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                {item.notes && <Text style={styles.requestNotes}>{item.notes}</Text>}
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="cash-remove" size={40} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có yêu cầu rút tiền nào</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
  walletCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  walletLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.82,
    marginBottom: 8,
  },
  walletAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  withdrawButton: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (screenWidth - 48) / 2,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stat1: {
    backgroundColor: '#E8F5E9',
  },
  stat2: {
    backgroundColor: '#E3F2FD',
  },
  stat3: {
    backgroundColor: '#FFF9E6',
  },
  stat4: {
    backgroundColor: '#FFE6E6',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  metricsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  metricBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginLeft: 12,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  infoCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  feedbackBanner: {
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
  },
  feedbackError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
  },
  feedbackTextSuccess: {
    color: '#166534',
  },
  feedbackTextError: {
    color: '#991b1b',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginTop: 14,
    marginBottom: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabButtonActive: {
    backgroundColor: '#0F172A',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  tabButtonCount: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabButtonCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    color: '#FFFFFF',
  },
  emptyStateText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
  },
  checkInCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  checkInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  checkInTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  checkInBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
  },
  checkInMeta: {
    marginTop: 6,
    fontSize: 13,
    color: '#475569',
  },
  checkInButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkInButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historySummaryCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  historySummaryLabel: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 6,
    fontWeight: '600',
  },
  historySummaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  historySummaryMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  historyCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  historyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  historyDate: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  confirmModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  confirmModalText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  confirmModalAmount: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  methodButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  methodButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  methodButtonText: {
    fontSize: 13,
    color: '#666',
  },
  methodButtonTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  historySection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  requestCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  requestStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  requestStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    marginBottom: 8,
  },
  requestMethod: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
  },
  requestNotes: {
    fontSize: 12,
    color: '#CC0000',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
});
