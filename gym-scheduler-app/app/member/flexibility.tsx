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
  FlatList,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMemberFeatures } from '../../src/hooks/useMemberFeatures';

export default function MemberFlexibilityScreen() {
  const { memberId } = useLocalSearchParams();
  const id = typeof memberId === 'string' ? parseInt(memberId) : 1;

  const {
    waitlist,
    freezes,
    loading,
    fetchWaitlist,
    fetchFreezes,
    joinWaitlist,
    leaveWaitlist,
    requestFreeze,
    cancelFreezeRequest,
  } = useMemberFeatures(id);

  const [activeTab, setActiveTab] = useState<'waitlist' | 'freeze'>('waitlist');
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeStartDate, setFreezeStartDate] = useState<string>('');
  const [freezeEndDate, setFreezeEndDate] = useState<string>('');
  const [freezeReason, setFreezeReason] = useState<'vacation' | 'medical' | 'personal'>(
    'vacation'
  );
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [itemType, setItemType] = useState<'class' | 'trainer'>('class');
  const [itemId, setItemId] = useState<string>('');

  useEffect(() => {
    fetchWaitlist();
    fetchFreezes();
  }, []);

  const handleJoinWaitlist = async () => {
    if (!itemId) {
      Alert.alert('Lỗi', 'Vui lòng nhập ID');
      return;
    }

    try {
      await joinWaitlist({
        item_type: itemType,
        item_id: parseInt(itemId),
      });
      Alert.alert('Thành công', 'Bạn đã được thêm vào danh sách chờ');
      setItemId('');
      setShowWaitlistModal(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const handleRequestFreeze = async () => {
    if (!freezeStartDate || !freezeEndDate) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }

    try {
      await requestFreeze({
        start_date: freezeStartDate,
        end_date: freezeEndDate,
        reason: freezeReason,
      });
      Alert.alert('Thành công', 'Yêu cầu bảo lưu gói đã được gửi');
      setFreezeStartDate('');
      setFreezeEndDate('');
      setFreezeReason('vacation');
      setShowFreezeModal(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const renderWaitlistTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowWaitlistModal(true)}
      >
        <Text style={styles.addButtonText}>+ Gia nhập danh sách chờ</Text>
      </TouchableOpacity>

      {waitlist.length === 0 ? (
        <Text style={styles.emptyText}>Không có danh sách chờ nào</Text>
      ) : (
        waitlist.map((entry) => (
          <View key={entry.id} style={styles.waitlistCard}>
            <View style={styles.waitlistHeader}>
              <View>
                <Text style={styles.waitlistTitle}>
                  {entry.item_type === 'class' ? '🏋️ Lớp học' : '👤 Trainer'}
                </Text>
                <Text style={styles.waitlistId}>ID: {entry.item_id}</Text>
              </View>
              <View
                style={[
                  styles.positionBadge,
                  entry.position <= 2 && styles.positionBadgeHigh,
                ]}
              >
                <Text style={styles.positionText}>#{entry.position}</Text>
              </View>
            </View>
            <View style={styles.waitlistFooter}>
              <Text style={styles.dateText}>
                Tham gia: {new Date(entry.created_at || '').toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  Alert.alert('Xác nhận', 'Bạn có chắc muốn rời khỏi danh sách?', [
                    {
                      text: 'Hủy',
                      onPress: () => {},
                    },
                    {
                      text: 'Xác nhận',
                      onPress: () => {
                        leaveWaitlist(entry.id!);
                      },
                    },
                  ]);
                }}
              >
                <Text style={styles.removeButtonText}>Rời</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderFreezeTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowFreezeModal(true)}
      >
        <Text style={styles.addButtonText}>+ Yêu cầu bảo lưu gói</Text>
      </TouchableOpacity>

      {freezes.length === 0 ? (
        <Text style={styles.emptyText}>Không có yêu cầu bảo lưu nào</Text>
      ) : (
        freezes.map((freeze) => (
          <View key={freeze.id} style={styles.freezeCard}>
            <View style={styles.freezeHeader}>
              <View>
                <Text style={styles.freezePeriod}>
                  {freeze.start_date} → {freeze.end_date}
                </Text>
                <Text style={styles.freezeReason}>
                  Lý do: {freeze.reason === 'vacation' ? 'Nghỉ phép' : freeze.reason}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  freeze.status === 'approved' && styles.statusApproved,
                  freeze.status === 'pending' && styles.statusPending,
                  freeze.status === 'active' && styles.statusActive,
                  freeze.status === 'expired' && styles.statusExpired,
                ]}
              >
                <Text style={styles.statusText}>
                  {freeze.status === 'approved' && '✓ Phê duyệt'}
                  {freeze.status === 'pending' && '⏳ Chờ'}
                  {freeze.status === 'active' && '▶ Đang bảo lưu'}
                  {freeze.status === 'expired' && '✕ Hết hạn'}
                </Text>
              </View>
            </View>
            <View style={styles.freezeDetails}>
              <Text style={styles.frozenDays}>
                Số ngày bảo lưu: {Math.ceil((new Date(freeze.end_date).getTime() - new Date(freeze.start_date).getTime()) / (1000 * 60 * 60 * 24))} ngày
              </Text>
              {freeze.status === 'pending' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    Alert.alert('Xác nhận', 'Bạn có chắc muốn hủy yêu cầu?', [
                      {
                        text: 'Không',
                        onPress: () => {},
                      },
                      {
                        text: 'Có',
                        onPress: () => {
                          cancelFreezeRequest(freeze.id!);
                        },
                      },
                    ]);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Hủy yêu cầu</Text>
                </TouchableOpacity>
              )}
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
          style={[styles.tab, activeTab === 'waitlist' && styles.tabActive]}
          onPress={() => setActiveTab('waitlist')}
        >
          <Text style={[styles.tabText, activeTab === 'waitlist' && styles.tabTextActive]}>
            Danh sách chờ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'freeze' && styles.tabActive]}
          onPress={() => setActiveTab('freeze')}
        >
          <Text style={[styles.tabText, activeTab === 'freeze' && styles.tabTextActive]}>
            Bảo lưu gói
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'waitlist' && renderWaitlistTab()}
      {activeTab === 'freeze' && renderFreezeTab()}

      {/* Waitlist Modal */}
      <Modal visible={showWaitlistModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gia nhập danh sách chờ</Text>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, itemType === 'class' && styles.typeButtonActive]}
                onPress={() => setItemType('class')}
              >
                <Text
                  style={[styles.typeButtonText, itemType === 'class' && styles.typeButtonTextActive]}
                >
                  🏋️ Lớp học
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, itemType === 'trainer' && styles.typeButtonActive]}
                onPress={() => setItemType('trainer')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    itemType === 'trainer' && styles.typeButtonTextActive,
                  ]}
                >
                  👤 Trainer
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder={`ID ${itemType === 'class' ? 'lớp học' : 'trainer'}`}
              value={itemId}
              onChangeText={setItemId}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowWaitlistModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleJoinWaitlist}
              >
                <Text style={styles.buttonText}>Gia nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Freeze Modal */}
      <Modal visible={showFreezeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yêu cầu bảo lưu gói</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày bắt đầu</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setFreezeStartDate(new Date().toISOString().split('T')[0])}
              >
                <Text style={styles.dateText}>{freezeStartDate || 'Chọn ngày'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày kết thúc</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setFreezeEndDate(new Date().toISOString().split('T')[0])}
              >
                <Text style={styles.dateText}>{freezeEndDate || 'Chọn ngày'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lý do</Text>
              <View style={styles.reasonButtons}>
                {(['vacation', 'medical', 'personal'] as const).map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonButton,
                      freezeReason === reason && styles.reasonButtonActive,
                    ]}
                    onPress={() => setFreezeReason(reason)}
                  >
                    <Text
                      style={[
                        styles.reasonButtonText,
                        freezeReason === reason && styles.reasonButtonTextActive,
                      ]}
                    >
                      {reason === 'vacation' && 'Nghỉ phép'}
                      {reason === 'medical' && 'Bệnh'}
                      {reason === 'personal' && 'Cá nhân'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowFreezeModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleRequestFreeze}
              >
                <Text style={styles.buttonText}>Gửi</Text>
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
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  tabTextActive: {
    color: '#FF6B6B',
  },
  tabContent: {
    padding: 16,
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
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 32,
  },
  waitlistCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  waitlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  waitlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  waitlistId: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  positionBadge: {
    backgroundColor: '#E6F7E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  positionBadgeHigh: {
    backgroundColor: '#FFE6E6',
  },
  positionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  waitlistFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFE6E6',
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
  },
  freezeCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  freezeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  freezePeriod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  freezeReason: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#FFF9E6',
  },
  statusApproved: {
    backgroundColor: '#E6F7E6',
  },
  statusPending: {
    backgroundColor: '#FFF9E6',
  },
  statusActive: {
    backgroundColor: '#E3F2FD',
  },
  statusExpired: {
    backgroundColor: '#FFE6E6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
  },
  freezeDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  frozenDays: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFE6E6',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
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
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
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
  dateInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  reasonButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reasonButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    alignItems: 'center',
  },
  reasonButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  reasonButtonText: {
    fontSize: 12,
    color: '#666',
  },
  reasonButtonTextActive: {
    color: '#FFF',
    fontWeight: '500',
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
  submitButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
