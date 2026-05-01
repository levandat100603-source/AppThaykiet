import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { api } from '../../src/api/client';
import { UI, getThemeColors } from '../../src/ui/design';
import { useThemeMode } from '../../src/ui/theme-mode';

type OrderItem = {
  id: number;
  item_name: string;
  item_type: string;
  price: number;
};

type Order = {
  id: number;
  total_amount: number;
  payment_method: string;
  status: string;
  vnpay_transaction_id?: string;
  vnpay_response_code?: string;
  vnpay_response_message?: string;
  created_at: string;
  payment_at?: string | null;
  items: OrderItem[];
};

type PaymentHistory = {
  orders: Order[];
  total: number;
  current_page: number;
  last_page: number;
  per_page: number;
};

const ITEMS_PER_PAGE = 10;

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);

  const [data, setData] = useState<PaymentHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async (page: number = 1) => {
    try {
      setLoading(page === 1);
      const res = await api.get(`/user/orders?page=${page}`);
      setData(res.data || { orders: [], total: 0, current_page: 1, last_page: 1, per_page: 10 });
      setCurrentPage(page);
    } catch (error: any) {
      console.log('Lỗi tải lịch sử thanh toán:', error?.response?.status, error?.response?.data || error?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData(1);
    }, [fetchData])
  );

  const orders = useMemo(() => data?.orders || [], [data]);
  const maxPage = useMemo(() => data?.last_page || 1, [data]);

  const statusColor = (status: string) => {
    if (status === 'completed') return '#16a34a';
    if (status === 'failed' || status === 'cancelled') return '#dc2626';
    if (status === 'pending') return '#ca8a04';
    return colors.textMuted;
  };

  const statusLabel = (status: string) => {
    if (status === 'completed') return 'Đã thanh toán';
    if (status === 'failed') return 'Thất bại';
    if (status === 'cancelled') return 'Hủy';
    if (status === 'pending') return 'Chờ xử lý';
    return status;
  };

  const statusIcon = (status: string) => {
    if (status === 'completed') return 'check-circle';
    if (status === 'failed' || status === 'cancelled') return 'close-circle';
    if (status === 'pending') return 'clock-outline';
    return 'help-circle-outline';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && orders.length === 0) {
    return (
      <View style={[styles.centerLoad, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(currentPage); }} />}
      >
        <View style={styles.pageHead}>
          <Pressable style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Quay lại hồ sơ</Text>
          </Pressable>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Lịch sử thanh toán</Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHead}>
            <MaterialCommunityIcons name="receipt-text-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Các giao dịch VNPay</Text>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="inbox-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Bạn chưa có giao dịch thanh toán nào.</Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={`order-${order.id}`} style={[styles.orderCard, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderLeft}>
                    <MaterialCommunityIcons name="credit-card" size={22} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.orderTitle, { color: colors.text }]}>Đơn hàng #{order.id}</Text>
                      <Text style={[styles.orderDate, { color: colors.textMuted }]}>
                        {formatDate(order.payment_at || order.created_at)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <MaterialCommunityIcons name={statusIcon(order.status) as any} size={16} color={statusColor(order.status)} />
                    <Text style={[styles.statusText, { color: statusColor(order.status) }]}>{statusLabel(order.status)}</Text>
                  </View>
                </View>

                <View style={[styles.orderDivider, { backgroundColor: colors.border }]} />

                <View style={styles.orderContent}>
                  <View style={styles.orderRow}>
                    <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Số tiền</Text>
                    <Text style={[styles.rowAmount, { color: colors.text }]}>{formatCurrency(order.total_amount)}</Text>
                  </View>

                  <View style={styles.orderRow}>
                    <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Phương thức</Text>
                    <Text style={[styles.rowValue, { color: colors.text }]}>{order.payment_method?.toUpperCase() || 'N/A'}</Text>
                  </View>

                  {order.vnpay_transaction_id && (
                    <View style={styles.orderRow}>
                      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Mã giao dịch</Text>
                      <Text style={[styles.rowValue, { color: colors.text, fontFamily: UI.font.body }]}>{order.vnpay_transaction_id}</Text>
                    </View>
                  )}

                  {order.vnpay_response_message && (
                    <View style={styles.orderRow}>
                      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>Kết quả</Text>
                      <Text style={[styles.rowValue, { color: colors.text }]}>{order.vnpay_response_message}</Text>
                    </View>
                  )}

                  {order.items && order.items.length > 0 && (
                    <View style={styles.itemsContainer}>
                      <Text style={[styles.itemsTitle, { color: colors.textMuted }]}>Sản phẩm:</Text>
                      {order.items.map((item, idx) => (
                        <View key={`item-${idx}`} style={styles.itemRow}>
                          <Text style={[styles.itemName, { color: colors.text }]}>• {item.item_name}</Text>
                          <Text style={[styles.itemPrice, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))
          )}

          {orders.length > 0 && maxPage > 1 && (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                disabled={currentPage === 1}
                onPress={() => fetchData(Math.max(1, currentPage - 1))}
              >
                <Text style={styles.pageBtnText}>Trước</Text>
              </Pressable>
              <Text style={[styles.pageInfo, { color: colors.text }]}>Trang {currentPage}/{maxPage}</Text>
              <Pressable
                style={[styles.pageBtn, currentPage >= maxPage && styles.pageBtnDisabled]}
                disabled={currentPage >= maxPage}
                onPress={() => fetchData(Math.min(maxPage, currentPage + 1))}
              >
                <Text style={styles.pageBtnText}>Sau</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.colors.bg },
  centerLoad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40, maxWidth: 920, marginHorizontal: 'auto', width: '100%' },

  pageHead: { marginBottom: 12 },
  backBtn: {
    alignSelf: 'flex-start',
    height: 36,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  backText: { fontWeight: '700', fontSize: 13, fontFamily: UI.font.body },
  pageTitle: { fontSize: 24, fontWeight: '800', fontFamily: UI.font.heading },

  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', fontFamily: UI.font.heading },

  emptyContainer: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, fontStyle: 'italic', fontFamily: UI.font.body },

  orderCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  orderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  orderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  orderTitle: { fontSize: 15, fontWeight: '700', fontFamily: UI.font.body },
  orderDate: { fontSize: 12, fontFamily: UI.font.body, marginTop: 2 },

  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700', fontFamily: UI.font.body },

  orderDivider: { height: 1, marginVertical: 10 },

  orderContent: { gap: 8 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13, fontFamily: UI.font.body },
  rowValue: { fontSize: 13, fontWeight: '700', fontFamily: UI.font.body },
  rowAmount: { fontSize: 14, fontWeight: '800', fontFamily: UI.font.body },

  itemsContainer: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  itemsTitle: { fontSize: 12, fontWeight: '700', fontFamily: UI.font.body, marginBottom: 6 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemName: { fontSize: 12, fontFamily: UI.font.body },
  itemPrice: { fontSize: 12, fontWeight: '700', fontFamily: UI.font.body },

  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14 },
  pageBtn: {
    backgroundColor: UI.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pageBtnDisabled: { opacity: 0.45 },
  pageBtnText: { color: '#fff', fontWeight: '700', fontSize: 13, fontFamily: UI.font.body },
  pageInfo: { fontSize: 13, fontWeight: '700', fontFamily: UI.font.body },
});
