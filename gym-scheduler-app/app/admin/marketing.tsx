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
  Switch,
} from 'react-native';
import { useAdminManagement } from '../../src/hooks/useAdminManagement';

export default function AdminMarketingScreen() {
  const {
    vouchers,
    campaigns,
    loading,
    fetchVouchers,
    fetchCampaigns,
    createVoucher,
    createCampaign,
    sendCampaignNow,
  } = useAdminManagement();

  const [activeTab, setActiveTab] = useState<'vouchers' | 'campaigns'>('vouchers');
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // Voucher form
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('');
  const [maxUses, setMaxUses] = useState<string>('');
  const [validFrom, setValidFrom] = useState<string>('');
  const [validUntil, setValidUntil] = useState<string>('');
  const [applicableTo, setApplicableTo] = useState<string>('all');

  // Campaign form
  const [campaignTitle, setCampaignTitle] = useState<string>('');
  const [campaignMessage, setCampaignMessage] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<string>('all');
  const [sendTime, setSendTime] = useState<string>('');

  useEffect(() => {
    fetchVouchers();
    fetchCampaigns();
  }, []);

  const handleCreateVoucher = async () => {
    if (!voucherCode || !discountValue) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã và giá trị giảm giá');
      return;
    }

    try {
      await createVoucher({
        code: voucherCode.toUpperCase(),
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        max_uses: maxUses ? parseInt(maxUses) : undefined,
        valid_from: validFrom || new Date().toISOString().split('T')[0],
        valid_until: validUntil || new Date().toISOString().split('T')[0],
        applicable_to: applicableTo,
      });
      Alert.alert('Thành công', 'Mã giảm giá đã được tạo');
      setVoucherCode('');
      setDiscountValue('');
      setMaxUses('');
      setShowVoucherModal(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignTitle || !campaignMessage) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    try {
      await createCampaign({
        title: campaignTitle,
        message: campaignMessage,
        target_audience: targetAudience,
        send_at: sendTime || undefined,
      });
      Alert.alert('Thành công', 'Chiến dịch đã được tạo');
      setCampaignTitle('');
      setCampaignMessage('');
      setShowCampaignModal(false);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    }
  };

  const renderVouchersTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowVoucherModal(true)}
      >
        <Text style={styles.addButtonText}>+ Tạo mã giảm giá</Text>
      </TouchableOpacity>

      <View style={styles.filterButtons}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Đang hoạt động</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Hết hạn</Text>
        </TouchableOpacity>
      </View>

      {vouchers.length === 0 ? (
        <Text style={styles.emptyText}>Không có mã giảm giá nào</Text>
      ) : (
        vouchers.map((voucher) => (
          <View key={voucher.id} style={styles.voucherCard}>
            <View style={styles.voucherHeader}>
              <Text style={styles.voucherCode}>{voucher.code}</Text>
              <View
                style={[
                  styles.voucherStatus,
                  voucher.is_active ? styles.statusActive : styles.statusInactive,
                ]}
              >
                <Text style={styles.statusText}>
                  {voucher.is_active ? '✓ Hoạt động' : '✗ Không hoạt động'}
                </Text>
              </View>
            </View>
            <View style={styles.voucherDetails}>
              <View>
                <Text style={styles.detailLabel}>Giảm giá</Text>
                <Text style={styles.detailValue}>
                  {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : `$${voucher.discount_value.toFixed(2)}`}
                </Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>Sử dụng</Text>
                <Text style={styles.detailValue}>
                  {voucher.used_count}{voucher.max_uses ? `/${voucher.max_uses}` : '/∞'}
                </Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>Hạn sử dụng</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {voucher.valid_until}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderCampaignsTab = () => (
    <ScrollView style={styles.tabContent}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowCampaignModal(true)}
      >
        <Text style={styles.addButtonText}>+ Tạo chiến dịch</Text>
      </TouchableOpacity>

      {campaigns.length === 0 ? (
        <Text style={styles.emptyText}>Không có chiến dịch nào</Text>
      ) : (
        campaigns.map((campaign) => (
          <View key={campaign.id} style={styles.campaignCard}>
            <View style={styles.campaignHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.campaignTitle}>{campaign.title}</Text>
                <Text style={styles.campaignMessage} numberOfLines={2}>
                  {campaign.message}
                </Text>
              </View>
              <View
                style={[
                  styles.campaignStatus,
                  campaign.status === 'sent' && styles.statusSent,
                  campaign.status === 'scheduled' && styles.statusScheduled,
                  campaign.status === 'draft' && styles.statusDraft,
                ]}
              >
                <Text style={styles.campaignStatusText}>
                  {campaign.status === 'sent' && '✓ Đã gửi'}
                  {campaign.status === 'scheduled' && '📅 Lên lịch'}
                  {campaign.status === 'draft' && '✎ Nháp'}
                </Text>
              </View>
            </View>
            <View style={styles.campaignFooter}>
              <View>
                <Text style={styles.campaignLabel}>Đối tượng</Text>
                <Text style={styles.campaignValue}>
                  {campaign.target_audience === 'all' && 'Tất cả thành viên'}
                  {campaign.target_audience === 'new_members' && 'Thành viên mới'}
                  {campaign.target_audience === 'inactive' && 'Thành viên không hoạt động'}
                </Text>
              </View>
              {campaign.status === 'draft' && (
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() => {
                    Alert.alert('Xác nhận', 'Gửi chiến dịch ngay bây giờ?', [
                      {
                        text: 'Hủy',
                        onPress: () => {},
                      },
                      {
                        text: 'Gửi',
                        onPress: () => {
                          sendCampaignNow(campaign.id!);
                        },
                      },
                    ]);
                  }}
                >
                  <Text style={styles.sendButtonText}>Gửi ngay</Text>
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
          style={[styles.tab, activeTab === 'vouchers' && styles.tabActive]}
          onPress={() => setActiveTab('vouchers')}
        >
          <Text style={[styles.tabText, activeTab === 'vouchers' && styles.tabTextActive]}>
            Mã giảm giá
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'campaigns' && styles.tabActive]}
          onPress={() => setActiveTab('campaigns')}
        >
          <Text style={[styles.tabText, activeTab === 'campaigns' && styles.tabTextActive]}>
            Chiến dịch
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'vouchers' && renderVouchersTab()}
      {activeTab === 'campaigns' && renderCampaignsTab()}

      {/* Voucher Modal */}
      <Modal visible={showVoucherModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo mã giảm giá</Text>

            <TextInput
              style={styles.input}
              placeholder="Mã (VD: SUMMER20)"
              value={voucherCode}
              onChangeText={setVoucherCode}
              autoCapitalize="characters"
            />

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, discountType === 'percentage' && styles.typeButtonActive]}
                onPress={() => setDiscountType('percentage')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    discountType === 'percentage' && styles.typeButtonTextActive,
                  ]}
                >
                  Phần trăm (%)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, discountType === 'fixed' && styles.typeButtonActive]}
                onPress={() => setDiscountType('fixed')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    discountType === 'fixed' && styles.typeButtonTextActive,
                  ]}
                >
                  Cố định ($)
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Giá trị giảm giá"
              value={discountValue}
              onChangeText={setDiscountValue}
              keyboardType="decimal-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Số lần sử dụng tối đa (để trống nếu không giới hạn)"
              value={maxUses}
              onChangeText={setMaxUses}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Ngày bắt đầu (YYYY-MM-DD)"
              value={validFrom}
              onChangeText={setValidFrom}
            />

            <TextInput
              style={styles.input}
              placeholder="Ngày kết thúc (YYYY-MM-DD)"
              value={validUntil}
              onChangeText={setValidUntil}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowVoucherModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleCreateVoucher}
              >
                <Text style={styles.buttonText}>Tạo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Campaign Modal */}
      <Modal visible={showCampaignModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo chiến dịch</Text>

            <TextInput
              style={styles.input}
              placeholder="Tiêu đề"
              value={campaignTitle}
              onChangeText={setCampaignTitle}
            />

            <TextInput
              style={[styles.input, styles.textAreaInput]}
              placeholder="Nội dung thông báo"
              value={campaignMessage}
              onChangeText={setCampaignMessage}
              multiline
              numberOfLines={5}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Đối tượng</Text>
              <View style={styles.audienceButtons}>
                {['all', 'new_members', 'inactive'].map((audience) => (
                  <TouchableOpacity
                    key={audience}
                    style={[
                      styles.audienceButton,
                      targetAudience === audience && styles.audienceButtonActive,
                    ]}
                    onPress={() => setTargetAudience(audience)}
                  >
                    <Text
                      style={[
                        styles.audienceButtonText,
                        targetAudience === audience && styles.audienceButtonTextActive,
                      ]}
                    >
                      {audience === 'all' && 'Tất cả'}
                      {audience === 'new_members' && 'Thành viên mới'}
                      {audience === 'inactive' && 'Không hoạt động'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Thời gian gửi (YYYY-MM-DD HH:mm) - để trống để gửi ngay"
              value={sendTime}
              onChangeText={setSendTime}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowCampaignModal(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleCreateCampaign}
              >
                <Text style={styles.buttonText}>Tạo</Text>
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
  filterButtons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 32,
  },
  voucherCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    letterSpacing: 1,
  },
  voucherStatus: {
    backgroundColor: '#E6F7E6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#E6F7E6',
  },
  statusInactive: {
    backgroundColor: '#FFE6E6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
  },
  voucherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  campaignCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  campaignMessage: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  campaignStatus: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#FFF9E6',
  },
  statusSent: {
    backgroundColor: '#E6F7E6',
  },
  statusScheduled: {
    backgroundColor: '#E3F2FD',
  },
  statusDraft: {
    backgroundColor: '#F0F0F0',
  },
  campaignStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  campaignLabel: {
    fontSize: 11,
    color: '#999',
  },
  campaignValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  sendButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
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
    maxHeight: '90%',
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
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
    fontSize: 13,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  audienceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  audienceButton: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    alignItems: 'center',
  },
  audienceButtonActive: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  audienceButtonText: {
    fontSize: 12,
    color: '#666',
  },
  audienceButtonTextActive: {
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
});
