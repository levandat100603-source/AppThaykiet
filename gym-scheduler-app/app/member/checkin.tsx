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
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMemberFeatures } from '../../src/hooks/useMemberFeatures';

export default function MemberCheckInScreen() {
  const { memberId } = useLocalSearchParams();
  const id = typeof memberId === 'string' ? parseInt(memberId) : 1;

  const {
    memberCard,
    cancellations,
    loading,
    fetchMemberCard,
    generateMemberCard,
    checkInFacility,
    getCancellationPolicy,
    cancelBooking,
    fetchCancellations,
  } = useMemberFeatures(id);

  const [activeTab, setActiveTab] = useState<'card' | 'cancel' | 'history'>('card');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancellationPolicy, setCancellationPolicy] = useState<any>(null);
  const [qrCodeScanned, setQrCodeScanned] = useState<string>('');

  useEffect(() => {
    fetchMemberCard();
    fetchCancellations();
  }, []);

  const handleGenerateCard = async () => {
    try {
      await generateMemberCard();
      Alert.alert('Thành công', 'Thẻ hội viên đã được tạo');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const handleCheckIn = async () => {
    if (!memberCard) {
      Alert.alert('Lỗi', 'Vui lòng tạo thẻ hội viên trước');
      return;
    }

    try {
      const response = await checkInFacility(memberCard.card_number);
      Alert.alert('Thành công', `Check-in lúc ${response.checkedInAt}`);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingId || !cancelReason) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ thông tin');
      return;
    }

    try {
      const response = await cancelBooking({
        booking_id: parseInt(bookingId),
        reason: cancelReason,
      });
      Alert.alert(
        'Thành công',
        `Hoàn tiền: $${response.refundAmount.toFixed(2)}\nPhi hủy: $${response.penalty.toFixed(2)}`
      );
      setBookingId('');
      setCancelReason('');
      setShowCancelModal(false);
      fetchCancellations();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const renderCardTab = () => (
    <ScrollView style={styles.tabContent}>
      {memberCard ? (
        <>
          <View style={styles.cardContainer}>
            <View style={styles.digitialCard}>
              <View style={styles.cardTop}>
                <Text style={styles.cardLabel}>GYM SCHEDULER</Text>
                <Text style={styles.cardNumber}>{memberCard.card_number}</Text>
              </View>

              {memberCard.qr_code && (
                <View style={styles.qrCodeContainer}>
                  <Text style={styles.qrLabel}>QR Code</Text>
                  <View style={styles.qrPlaceholder}>
                    <Text style={styles.qrText}>📱 {memberCard.card_number.substring(0, 8)}...</Text>
                  </View>
                </View>
              )}

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardMemberLabel}>HỘI VIÊN #{id}</Text>
                  <Text style={styles.cardMemberName}>Thành viên</Text>
                </View>
                <View
                  style={[
                    styles.cardStatus,
                    memberCard.is_active ? styles.cardStatusActive : styles.cardStatusInactive,
                  ]}
                >
                  <Text style={styles.cardStatusText}>
                    {memberCard.is_active ? '✓ Hoạt động' : '✗ Không hoạt động'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.checkInButton} onPress={handleCheckIn}>
            <Text style={styles.checkInButtonText}>📱 Check-in tại cơ sở</Text>
          </TouchableOpacity>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Hướng dẫn sử dụng</Text>
            <Text style={styles.infoText}>
              • Xuất trình QR code hoặc số thẻ tại quầy để check-in{'\n'}
              • Mỗi lần check-in sẽ được ghi nhận{'\n'}
              • Giữ thẻ an toàn và không chia sẻ
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Chưa có thẻ hội viên</Text>
          <Text style={styles.emptyText}>Tạo thẻ để có thể check-in tại cơ sở</Text>
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateCard}>
            <Text style={styles.generateButtonText}>+ Tạo thẻ hội viên</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderCancelTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowCancelModal(true)}
      >
        <Text style={styles.addButtonText}>+ Hủy lịch</Text>
      </TouchableOpacity>

      <View style={styles.policyCard}>
        <Text style={styles.policyTitle}>Chính sách hủy</Text>
        <View style={styles.policyRow}>
          <Text style={styles.policyLabel}>Hủy trước 2 giờ:</Text>
          <Text style={styles.policyValue}>100% hoàn tiền</Text>
        </View>
        <View style={styles.policyRow}>
          <Text style={styles.policyLabel}>Hủy trong 2 giờ:</Text>
          <Text style={styles.policyValue}>Không hoàn tiền</Text>
        </View>
        <View style={styles.policyRow}>
          <Text style={styles.policyLabel}>Phí hủy:</Text>
          <Text style={styles.policyValue}>10% giá tiền</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      {cancellations.length === 0 ? (
        <Text style={styles.emptyText}>Không có lịch sử hủy nào</Text>
      ) : (
        cancellations.map((cancellation) => (
          <View key={cancellation.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Lịch #{cancellation.booking_id}</Text>
              <View
                style={[
                  styles.historyStatus,
                  cancellation.status === 'processed' && styles.historyStatusProcessed,
                ]}
              >
                <Text style={styles.historyStatusText}>
                  {cancellation.status === 'processed' ? '✓ Đã xử lý' : '⏳ Chờ xử lý'}
                </Text>
              </View>
            </View>
            <Text style={styles.historyReason}>
              Lý do: {cancellation.reason}
            </Text>
            <View style={styles.historyDetails}>
              <View>
                <Text style={styles.historyLabel}>Hoàn tiền:</Text>
                <Text style={styles.historyValue}>${cancellation.refund_amount.toFixed(2)}</Text>
              </View>
              <View>
                <Text style={styles.historyLabel}>Phí hủy:</Text>
                <Text style={styles.historyValue}>${cancellation.penalty.toFixed(2)}</Text>
              </View>
              <View>
                <Text style={styles.historyLabel}>Ngày:</Text>
                <Text style={styles.historyValue}>
                  {new Date(cancellation.cancelled_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'card' && styles.tabActive]}
          onPress={() => setActiveTab('card')}
        >
          <Text style={[styles.tabText, activeTab === 'card' && styles.tabTextActive]}>
            Thẻ hội viên
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cancel' && styles.tabActive]}
          onPress={() => setActiveTab('cancel')}
        >
          <Text style={[styles.tabText, activeTab === 'cancel' && styles.tabTextActive]}>
            Hủy lịch
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Lịch sử
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'card' && renderCardTab()}
      {activeTab === 'cancel' && renderCancelTab()}
      {activeTab === 'history' && renderHistoryTab()}

      {/* Cancel Modal */}
      <Modal visible={showCancelModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hủy lịch</Text>

            <TextInput
              style={styles.input}
              placeholder="ID lịch"
              value={bookingId}
              onChangeText={setBookingId}
              keyboardType="numeric"
            />

            <TextInput
              style={[styles.input, styles.textAreaInput]}
              placeholder="Lý do hủy"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={4}
            />

            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>⚠️ Lưu ý</Text>
              <Text style={styles.warningText}>
                Việc hủy lịch có thể tính phí. Vui lòng kiểm tra chính sách hủy.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleCancelBooking}
              >
                <Text style={styles.buttonText}>Xác nhận hủy</Text>
              </TouchableOpacity>
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
    backgroundColor: '#F5F5F5',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
  },
  tabTextActive: {
    color: '#FF6B6B',
  },
  tabContent: {
    padding: 16,
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  digitialCard: {
    backgroundColor: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E72 100%)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTop: {
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    letterSpacing: 2,
  },
  qrCodeContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 10,
    fontWeight: '600',
  },
  qrPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  qrText: {
    fontSize: 14,
    color: '#999',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardMemberLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  cardMemberName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  cardStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cardStatusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },
  cardStatusInactive: {
    backgroundColor: 'rgba(255, 107, 107, 0.3)',
    borderColor: 'rgba(255, 107, 107, 0.6)',
  },
  cardStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  checkInButton: {
    paddingVertical: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  checkInButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#E6F7E6',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
    textAlign: 'center',
  },
  generateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    paddingVertical: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  policyCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  policyLabel: {
    fontSize: 13,
    color: '#666',
  },
  policyValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  historyStatus: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyStatusProcessed: {
    backgroundColor: '#E6F7E6',
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  historyReason: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 10,
  },
  historyLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  historyValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textAreaInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  warningCard: {
    backgroundColor: '#FFE6E6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
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
});
