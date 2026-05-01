import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Linking,
  ActivityIndicator,
  ScrollView,
  Clipboard,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { UI } from '../src/ui/design';

interface VNPayQRModalProps {
  visible: boolean;
  paymentUrl: string;
  orderId: number;
  amount: number;
  onClose: () => void;
  onOpenPayment: () => void;
  loading?: boolean;
}

export default function VNPayQRModal({
  visible,
  paymentUrl,
  orderId,
  amount,
  onClose,
  onOpenPayment,
  loading = false,
}: VNPayQRModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    Clipboard.setString(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenPayment = () => {
    console.log('handleOpenPayment called, URL:', paymentUrl);
    if (!paymentUrl) {
      Alert.alert('Lỗi', 'URL thanh toán chưa sẵn sàng. Vui lòng thử lại!');
      return;
    }
    Linking.openURL(paymentUrl).catch(err => {
      console.error('Opening payment URL failed:', err);
      Alert.alert('Lỗi', 'Không thể mở trang thanh toán. Vui lòng thử lại!');
    });
    onOpenPayment();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalContent}>
            {/* Header with Quick Action */}
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Thanh toán VNPay</Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={UI.colors.text} />
                </Pressable>
              </View>
              
              {/* Quick Open Payment Button */}
              {!loading && (
                <Pressable
                  style={styles.quickOpenBtn}
                  onPress={handleOpenPayment}
                >
                  <MaterialCommunityIcons
                    name="open-in-new"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.quickOpenBtnText}>
                    Mở trang thanh toán ngay
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Order Info */}
            <View style={styles.orderInfo}>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Mã đơn hàng:</Text>
                <Text style={styles.orderValue}>#{orderId}</Text>
              </View>
              <View style={styles.orderRow}>
                <Text style={styles.orderLabel}>Số tiền:</Text>
                <Text style={styles.orderValueAmount}>
                  {amount.toLocaleString('vi-VN')}đ
                </Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={UI.colors.primary} />
                <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
              </View>
            ) : (
              <>
                {/* QR Code */}
                <View style={styles.qrContainer}>
                  <View style={styles.qrBox}>
                    <QRCode
                      value={paymentUrl}
                      size={280}
                      color={UI.colors.text}
                      backgroundColor="#fff"
                      quietZone={10}
                    />
                  </View>
                  <Text style={styles.qrLabel}>
                    Quét mã QR để copy link, hoặc click "Mở trang thanh toán" để thanh toán ngay
                  </Text>
                </View>

                {/* Copy Link Section */}
                <View style={styles.linkSection}>
                  <Text style={styles.linkLabel}>Hoặc sao chép link thanh toán:</Text>
                  <Pressable
                    style={styles.copyBtn}
                    onPress={handleCopyLink}
                  >
                    <MaterialCommunityIcons
                      name={copied ? 'check' : 'content-copy'}
                      size={18}
                      color={copied ? '#16a34a' : '#2563eb'}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={[styles.copyBtnText, copied && styles.copiedText]}>
                      {copied ? 'Đã sao chép' : 'Sao chép link'}
                    </Text>
                  </Pressable>
                </View>

                {/* Instructions */}
                <View style={styles.instructions}>
                  <View style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      Click "Mở trang thanh toán" để xác nhận thanh toán ngay
                    </Text>
                  </View>

                  <View style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      Hoặc sao chép link và mở trong browser để thanh toán
                    </Text>
                  </View>

                  <View style={styles.instructionItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <Text style={styles.instructionText}>
                      Nhập mật khẩu/OTP và xác nhận trên trang VNPay
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                  <Pressable
                    style={styles.openPaymentBtn}
                    onPress={handleOpenPayment}
                  >
                    <MaterialCommunityIcons
                      name="open-in-new"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.openPaymentBtnText}>
                      Mở trang thanh toán
                    </Text>
                  </Pressable>

                  <Pressable style={styles.cancelBtn} onPress={onClose}>
                    <Text style={styles.cancelBtnText}>Hủy</Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* Info Box */}
            <View style={styles.infoBox}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color="#0ea5e9"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.infoText}>
                💡 Bấm "Mở trang thanh toán" là cách nhanh nhất. QR code là tùy chọn để copy link.
              </Text>
            </View>

            {/* Debug Info */}
            <View style={{ marginTop: 10, padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}>
              <Text style={{ fontSize: 10, color: '#666' }}>
                Debug: URL = {paymentUrl ? 'OK' : 'EMPTY'}, Loading = {loading ? 'true' : 'false'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: UI.colors.text,
    fontFamily: UI.font.heading,
  },
  closeBtn: {
    padding: 8,
  },
  quickOpenBtn: {
    backgroundColor: UI.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickOpenBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: UI.font.body,
  },
  orderInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: UI.colors.primary,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 14,
    color: UI.colors.textMuted,
    fontWeight: '600',
    fontFamily: UI.font.body,
  },
  orderValue: {
    fontSize: 14,
    color: UI.colors.text,
    fontWeight: '700',
    fontFamily: UI.font.body,
  },
  orderValueAmount: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '800',
    fontFamily: UI.font.heading,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: UI.colors.textMuted,
    fontFamily: UI.font.body,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLabel: {
    fontSize: 13,
    color: UI.colors.textMuted,
    textAlign: 'center',
    fontFamily: UI.font.body,
  },
  linkSection: {
    marginBottom: 24,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: UI.colors.text,
    marginBottom: 10,
    fontFamily: UI.font.body,
  },
  copyBtn: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
    fontFamily: UI.font.body,
  },
  copiedText: {
    color: '#16a34a',
  },
  instructions: {
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: UI.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: UI.font.body,
  },
  instructionText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
    flex: 1,
    fontFamily: UI.font.body,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
    marginBottom: 16,
  },
  openPaymentBtn: {
    backgroundColor: UI.colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  openPaymentBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: UI.font.body,
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelBtnText: {
    color: UI.colors.textMuted,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: UI.font.body,
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#0ea5e9',
  },
  infoText: {
    fontSize: 13,
    color: '#0369a1',
    fontFamily: UI.font.body,
    flex: 1,
    lineHeight: 18,
  },
});
