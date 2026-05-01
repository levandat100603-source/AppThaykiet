import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../src/api/client';
import { UI, getThemeColors } from '../../src/ui/design';
import { useThemeMode } from '../../src/ui/theme-mode';

interface WithdrawalRequestItem {
  id: number;
  trainer_id: number;
  trainer_name?: string | null;
  trainer_email?: string | null;
  trainer_phone?: string | null;
  amount: string | number;
  method: string;
  bank_details?: {
    account_number?: string;
    account_holder?: string;
    bank_name?: string;
  } | null;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  notes?: string | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  confirmation_images?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

const API_ORIGIN = (() => {
  const baseURL = api.defaults.baseURL;
  if (!baseURL) return null;
  try {
    return new URL(baseURL).origin;
  } catch {
    return null;
  }
})();

const normalizeImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_ORIGIN) return `${API_ORIGIN}${url}`;
  return url;
};

const formatMoney = (value: unknown) => {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) return '0đ';
  return `${numberValue.toLocaleString('vi-VN')}đ`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('vi-VN');
  } catch {
    return value;
  }
};

export default function AdminPayrollScreen() {
  const router = useRouter();
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);

  const [requests, setRequests] = useState<WithdrawalRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequestItem | null>(null);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<'approve' | 'reject' | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/withdrawal-requests');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      console.log('Lỗi tải yêu cầu rút tiền:', error?.response?.data || error?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const pendingRequests = useMemo(() => requests.filter((item) => item.status === 'pending'), [requests]);
  const approvedRequests = useMemo(() => requests.filter((item) => item.status === 'approved' || item.status === 'processed'), [requests]);
  const rejectedRequests = useMemo(() => requests.filter((item) => item.status === 'rejected'), [requests]);

  const statusPalette = (status: WithdrawalRequestItem['status']) => {
    if (status === 'approved' || status === 'processed') {
      return isDark ? { bg: '#14532d', fg: '#4ade80' } : { bg: '#dcfce7', fg: '#166534' };
    }
    if (status === 'rejected') {
      return isDark ? { bg: '#7f1d1d', fg: '#f87171' } : { bg: '#fee2e2', fg: '#b91c1c' };
    }
    return isDark ? { bg: '#713f12', fg: '#fbbf24' } : { bg: '#fef3c7', fg: '#b45309' };
  };

  const statusLabel = (status: WithdrawalRequestItem['status']) => {
    if (status === 'approved') return 'Đã duyệt';
    if (status === 'processed') return 'Đã chuyển khoản';
    if (status === 'rejected') return 'Đã từ chối';
    return 'Chờ xử lý';
  };

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  const openApproveModal = (item: WithdrawalRequestItem) => {
    setSelectedRequest(item);
    setApproveNotes(item.notes || '');
    setSelectedImages([]);
    setActiveModal('approve');
  };

  const openRejectModal = (item: WithdrawalRequestItem) => {
    setSelectedRequest(item);
    setRejectReason('');
    setActiveModal('reject');
  };

  const pickConfirmationImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 3,
        quality: 0.85,
      });

      if (result.canceled) return;
      setSelectedImages(result.assets.slice(0, 3));
    } catch (error) {
      console.log('Chọn ảnh thất bại:', error);
      showMessage('Lỗi', 'Không thể chọn ảnh xác nhận.');
    }
  };

  const appendAssetToFormData = async (formData: FormData, asset: ImagePicker.ImagePickerAsset, fieldName: string) => {
    if (Platform.OS === 'web' && asset.uri.startsWith('blob:')) {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      formData.append(fieldName, blob as any, asset.fileName || 'confirmation.jpg');
      return;
    }

    const fileName = asset.fileName || asset.uri.split('/').pop() || 'confirmation.jpg';
    const match = /\.(\w+)$/.exec(fileName);
    const type = asset.mimeType || (match ? `image/${match[1]}` : 'image/jpeg');
    formData.append(fieldName, { uri: asset.uri, name: fileName, type } as any);
  };

  const submitApprove = async () => {
    if (!selectedRequest) return;
    if (selectedImages.length === 0) {
      showMessage('Thiếu ảnh', 'Vui lòng chọn ít nhất 1 ảnh xác nhận chuyển khoản.');
      return;
    }

    try {
      setSubmitLoading(true);
      // Rebuild sequentially to preserve async order.
      const uploadFormData = new FormData();
      uploadFormData.append('notes', approveNotes);
      for (const asset of selectedImages.slice(0, 3)) {
        await appendAssetToFormData(uploadFormData, asset, 'confirmation_images[]');
      }

      await api.post(`/admin/withdrawal-requests/${selectedRequest.id}/approve`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showMessage('Thành công', 'Đã duyệt yêu cầu rút tiền.');
      setActiveModal(null);
      setSelectedRequest(null);
      await fetchData();
    } catch (error: any) {
      showMessage('Lỗi', error?.response?.data?.message || 'Không thể duyệt yêu cầu.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const submitReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      showMessage('Thiếu lý do', 'Vui lòng nhập lý do từ chối.');
      return;
    }

    try {
      setSubmitLoading(true);
      await api.post(`/admin/withdrawal-requests/${selectedRequest.id}/reject`, { notes: rejectReason.trim() });
      showMessage('Thành công', 'Đã từ chối yêu cầu và hoàn số dư cho trainer.');
      setActiveModal(null);
      setSelectedRequest(null);
      await fetchData();
    } catch (error: any) {
      showMessage('Lỗi', error?.response?.data?.message || 'Không thể từ chối yêu cầu.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <View style={[styles.centerLoad, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderRequestCard = (item: WithdrawalRequestItem, showActions = false) => {
    const palette = statusPalette(item.status);
    return (
      <View key={item.id} style={[styles.cardItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.trainer_name || 'Trainer #' + item.trainer_id}</Text>
            <Text style={[styles.cardSub, { color: colors.textMuted }]}>{item.trainer_email || item.trainer_phone || 'Không có thông tin liên hệ'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: palette.bg }]}>
            <Text style={[styles.statusText, { color: palette.fg }]}>{statusLabel(item.status)}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Số tiền</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{formatMoney(item.amount)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Phương thức</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{item.method}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Tạo lúc</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{formatDateTime(item.created_at)}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Duyệt lúc</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{formatDateTime(item.approved_at)}</Text>
          </View>
        </View>

        {item.bank_details && (
          <View style={[styles.bankBox, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <Text style={[styles.bankTitle, { color: colors.text }]}>Thông tin chuyển khoản</Text>
            <Text style={[styles.bankText, { color: colors.textMuted }]}>Ngân hàng: {item.bank_details.bank_name || '—'}</Text>
            <Text style={[styles.bankText, { color: colors.textMuted }]}>Chủ tài khoản: {item.bank_details.account_holder || '—'}</Text>
            <Text style={[styles.bankText, { color: colors.textMuted }]}>Số tài khoản: {item.bank_details.account_number || '—'}</Text>
          </View>
        )}

        {!!item.notes && (
          <View style={styles.noteBox}>
            <Text style={[styles.noteLabel, { color: colors.textMuted }]}>Ghi chú:</Text>
            <Text style={[styles.noteText, { color: colors.text }]}>{item.notes}</Text>
          </View>
        )}

        {Array.isArray(item.confirmation_images) && item.confirmation_images.length > 0 && (
          <View style={styles.imageSection}>
            <Text style={[styles.imageSectionTitle, { color: colors.textMuted }]}>Ảnh xác nhận</Text>
            <View style={styles.imageGrid}>
              {item.confirmation_images.slice(0, 3).map((uri, index) => (
                <Image key={`${item.id}-${index}`} source={{ uri: normalizeImageUrl(uri) }} style={styles.confirmImage} />
              ))}
            </View>
          </View>
        )}

        {showActions && (
          <View style={styles.actionRow}>
            <Pressable style={[styles.rejectBtn, { borderColor: colors.border }]} onPress={() => openRejectModal(item)}>
              <MaterialCommunityIcons name="close-circle-outline" size={18} color="#dc2626" />
              <Text style={[styles.rejectBtnText, { color: '#dc2626' }]}>Từ chối</Text>
            </Pressable>
            <Pressable style={[styles.approveBtn, { backgroundColor: colors.primary }]} onPress={() => openApproveModal(item)}>
              <MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" />
              <Text style={styles.approveBtnText}>Xác nhận thanh toán</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <Pressable style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => router.push('/admin/allinfo' as any)}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Quản trị hệ thống</Text>
          </Pressable>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Thanh toán lương</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>Duyệt yêu cầu rút tiền của trainer và lưu ảnh xác nhận chuyển khoản.</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Chờ xử lý</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{pendingRequests.length}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Đã duyệt</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{approvedRequests.length}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Đã từ chối</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{rejectedRequests.length}</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="timer-sand" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Yêu cầu chờ duyệt</Text>
          </View>
          {pendingRequests.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Không có yêu cầu nào đang chờ xử lý.</Text>
          ) : (
            pendingRequests.map((item) => renderRequestCard(item, true))
          )}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="check-decagram-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Đã xác nhận thanh toán</Text>
          </View>
          {approvedRequests.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Chưa có trainer nào được xác nhận thanh toán.</Text>
          ) : (
            approvedRequests.map((item) => renderRequestCard(item, false))
          )}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="close-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Yêu cầu bị từ chối</Text>
          </View>
          {rejectedRequests.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Chưa có yêu cầu nào bị từ chối.</Text>
          ) : (
            rejectedRequests.map((item) => renderRequestCard(item, false))
          )}
        </View>
      </ScrollView>

      <Modal visible={activeModal !== null} transparent animationType="slide" onRequestClose={() => setActiveModal(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {activeModal === 'approve' ? 'Xác nhận thanh toán' : 'Từ chối yêu cầu'}
              </Text>
              <Pressable onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {selectedRequest && (
              <Text style={[styles.modalSub, { color: colors.textMuted }]}>Trainer: {selectedRequest.trainer_name || selectedRequest.trainer_email} • {formatMoney(selectedRequest.amount)}</Text>
            )}

            {activeModal === 'approve' ? (
              <>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Ghi chú chuyển khoản</Text>
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceMuted }]}
                  value={approveNotes}
                  onChangeText={setApproveNotes}
                  placeholder="Ví dụ: Đã chuyển khoản thành công lúc 15:20"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />

                <View style={styles.imagePickerHeader}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Ảnh xác nhận (1-3 ảnh)</Text>
                  <Pressable style={[styles.pickBtn, { backgroundColor: colors.primary }]} onPress={pickConfirmationImages}>
                    <MaterialCommunityIcons name="image-multiple-outline" size={16} color="#fff" />
                    <Text style={styles.pickBtnText}>Chọn ảnh</Text>
                  </Pressable>
                </View>

                {selectedImages.length > 0 && (
                  <View style={styles.previewImageGrid}>
                    {selectedImages.slice(0, 3).map((asset) => (
                      <Image key={asset.assetId || asset.uri} source={{ uri: asset.uri }} style={styles.previewImage} />
                    ))}
                  </View>
                )}

                <View style={styles.modalActions}>
                  <Pressable style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={() => setActiveModal(null)} disabled={submitLoading}>
                    <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Hủy</Text>
                  </Pressable>
                  <Pressable style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={submitApprove} disabled={submitLoading}>
                    {submitLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Xác nhận</Text>}
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Lý do từ chối</Text>
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceMuted }]}
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  placeholder="Nhập lý do từ chối"
                  placeholderTextColor={colors.textMuted}
                  multiline
                />

                <View style={styles.modalActions}>
                  <Pressable style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={() => setActiveModal(null)} disabled={submitLoading}>
                    <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Hủy</Text>
                  </Pressable>
                  <Pressable style={[styles.rejectConfirmBtn, { backgroundColor: '#dc2626' }]} onPress={submitReject} disabled={submitLoading}>
                    {submitLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Từ chối</Text>}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.colors.bg },
  centerLoad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40, maxWidth: 1100, marginHorizontal: 'auto', width: '100%' },

  headerRow: { marginBottom: 16 },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  backText: { fontSize: 13, fontWeight: '700', fontFamily: UI.font.body },
  pageTitle: { fontSize: 28, fontWeight: '800', fontFamily: UI.font.heading },
  pageSubtitle: { fontSize: 13, marginTop: 4, fontFamily: UI.font.body },

  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  summaryCard: { minWidth: 150, flex: 1, borderWidth: 1, borderRadius: 14, padding: 14 },
  summaryLabel: { fontSize: 12, fontFamily: UI.font.body },
  summaryValue: { fontSize: 24, fontWeight: '800', fontFamily: UI.font.heading, marginTop: 6 },

  sectionCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', fontFamily: UI.font.heading },
  emptyText: { fontSize: 14, fontStyle: 'italic', fontFamily: UI.font.body },

  cardItem: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', fontFamily: UI.font.body },
  cardSub: { fontSize: 12, marginTop: 2, fontFamily: UI.font.body },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { fontSize: 12, fontWeight: '800', fontFamily: UI.font.body },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  infoCell: { minWidth: 180, flexGrow: 1 },
  infoLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, fontFamily: UI.font.body },
  infoValue: { fontSize: 13, fontWeight: '700', marginTop: 2, fontFamily: UI.font.body },

  bankBox: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  bankTitle: { fontSize: 13, fontWeight: '800', marginBottom: 6, fontFamily: UI.font.body },
  bankText: { fontSize: 12, marginBottom: 3, fontFamily: UI.font.body },
  noteBox: { marginBottom: 12 },
  noteLabel: { fontSize: 12, fontWeight: '700', marginBottom: 3, fontFamily: UI.font.body },
  noteText: { fontSize: 13, fontFamily: UI.font.body },

  imageSection: { marginBottom: 12 },
  imageSectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: 8, fontFamily: UI.font.body },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  confirmImage: { width: 110, height: 110, borderRadius: 10, backgroundColor: '#e2e8f0' },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  rejectBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  rejectBtnText: { fontSize: 13, fontWeight: '800', fontFamily: UI.font.body },
  approveBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  approveBtnText: { color: '#fff', fontSize: 13, fontWeight: '800', fontFamily: UI.font.body },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  modalCard: { borderRadius: 18, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', fontFamily: UI.font.heading },
  modalSub: { fontSize: 13, marginBottom: 12, fontFamily: UI.font.body },
  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6, fontFamily: UI.font.body },
  textArea: { minHeight: 96, borderWidth: 1, borderRadius: 12, padding: 12, textAlignVertical: 'top', marginBottom: 12, fontFamily: UI.font.body },
  imagePickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' },
  pickBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  pickBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, fontFamily: UI.font.body },
  previewImageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  previewImage: { width: 88, height: 88, borderRadius: 10, backgroundColor: '#e2e8f0' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  secondaryBtnText: { fontSize: 13, fontWeight: '800', fontFamily: UI.font.body },
  primaryBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  rejectConfirmBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 13, fontWeight: '800', fontFamily: UI.font.body },
});
