import { useState, useCallback } from 'react';
import { api } from '../api/client';

interface VNPayResponse {
  success: boolean;
  payment_url?: string;
  order_id?: number;
  message?: string;
  status?: string;
}

export function useVNPay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  /**
   * Create VNPay payment URL
   */
  const createPaymentUrl = useCallback(
    async (orderId: number, appReturnUrl?: string): Promise<VNPayResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/vnpay/create-payment', {
          order_id: orderId,
          app_return_url: appReturnUrl,
        });

        console.log('VNPay Response:', response.data); // Debug log

        if (response.data?.success) {
          setPaymentUrl(response.data.payment_url);
          console.log('Payment URL:', response.data.payment_url); // Debug log
          return {
            success: true,
            payment_url: response.data.payment_url,
            order_id: response.data.order_id,
          };
        } else {
          const errorMsg = response.data?.message || 'Tạo URL thanh toán thất bại';
          setError(errorMsg);
          console.error('VNPay Error:', errorMsg); // Debug log
          return {
            success: false,
            message: errorMsg,
          };
        }
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Lỗi kết nối đến máy chủ';
        setError(errorMsg);
        console.error('VNPay Exception:', err); // Debug log
        return {
          success: false,
          message: errorMsg,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Check payment status
   */
  const checkPaymentStatus = useCallback(
    async (orderId: number): Promise<VNPayResponse> => {
      try {
        const response = await api.post('/vnpay/check-status', {
          order_id: orderId,
        });

        return {
          success: response.data?.success,
          status: response.data?.status,
          message: response.data?.message,
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.response?.data?.message || 'Lỗi kiểm tra trạng thái',
        };
      }
    },
    []
  );

  /**
   * Open VNPay payment gateway in WebView
   */
  const openVNPayGateway = useCallback((url: string): void => {
    if (typeof window !== 'undefined') {
      // Web platform
      window.location.href = url;
    } else {
      // Mobile platform - should be handled in component with WebView
      setPaymentUrl(url);
    }
  }, []);

  return {
    loading,
    error,
    paymentUrl,
    createPaymentUrl,
    checkPaymentStatus,
    openVNPayGateway,
  };
}
