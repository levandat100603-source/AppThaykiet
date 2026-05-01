import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UI } from '../src/ui/design';

export default function VNPayCallbackPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string; message?: string; order_id?: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const deepLinkStatus = (params.status || '').toLowerCase();
    const deepLinkMessage = params.message || '';
    const deepLinkOrderId = params.order_id;

    if (deepLinkOrderId && /^\d+$/.test(deepLinkOrderId)) {
      setOrderId(Number(deepLinkOrderId));
    }

    if (deepLinkStatus === 'success') {
      setStatus('success');
      setMessage(deepLinkMessage || 'Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.');
      return;
    }

    if (deepLinkStatus === 'error' || deepLinkStatus === 'failed') {
      setStatus('error');
      setMessage(deepLinkMessage || 'Thanh toán thất bại. Vui lòng thử lại.');
      return;
    }

    setStatus('error');
    setMessage('Không nhận được trạng thái thanh toán hợp lệ.');
  }, [params.message, params.order_id, params.status]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    setSecondsLeft(10);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleReturnToHome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const handleReturnToHome = () => {
    const target = status === 'success' ? '/profile/payments' : '/checkout';
    // Defer navigation to next tick to avoid updating parent navigator during render
    setTimeout(() => {
      try {
        router.replace(target);
      } catch (e) {
        // swallow any navigation error
        console.log('Navigation deferred replace failed', e);
      }
    }, 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'loading' ? (
          <>
            <ActivityIndicator size="large" color={UI.colors.primary} />
            <Text style={styles.message}>{message}</Text>
          </>
        ) : status === 'success' ? (
          <>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons
                name="check-circle"
                size={80}
                color="#16a34a"
              />
            </View>
            <Text style={styles.title}>Thanh toán thành công</Text>
            <Text style={styles.message}>{message}</Text>
            {orderId && (
              <Text style={styles.orderId}>Mã đơn hàng: #{orderId}</Text>
            )}
          </>
        ) : (
          <>
            <View style={styles.errorIcon}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={80}
                color="#dc2626"
              />
            </View>
            <Text style={styles.title}>Thanh toán thất bại</Text>
            <Text style={styles.message}>{message}</Text>
          </>
        )}

        {status !== 'loading' && (
          <>
            <Text style={styles.countdownText}>Tự động quay sau {secondsLeft}s</Text>
            <Pressable style={styles.button} onPress={handleReturnToHome}>
            <Text style={styles.buttonText}>
              {status === 'success' ? 'Về lịch sử thanh toán' : 'Quay lại thanh toán'}
            </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  successIcon: {
    marginBottom: 24,
  },
  errorIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: UI.colors.text,
    marginBottom: 12,
    fontFamily: UI.font.heading,
  },
  message: {
    fontSize: 16,
    color: UI.colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    fontFamily: UI.font.body,
  },
  orderId: {
    fontSize: 14,
    color: UI.colors.primary,
    fontWeight: '700',
    marginBottom: 24,
    fontFamily: UI.font.body,
  },
  countdownText: {
    fontSize: 13,
    color: UI.colors.textMuted,
    marginBottom: 8,
    fontFamily: UI.font.body,
  },
  button: {
    backgroundColor: UI.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: UI.font.body,
  },
});
