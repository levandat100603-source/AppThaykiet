import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  Alert,
  ActivityIndicator,
    Platform,
    useWindowDimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useCart } from '../../src/api/context/CartContext';
import { api } from '../../src/api/client';
import { UI } from '../../src/ui/design';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, removeFromCart } = useCart(); 
  
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [isProcessing, setIsProcessing] = useState(false);
    const { width } = useWindowDimensions();
    const isMobileLayout = width < 900;
    const isSmallPhone = width < 420;

  const vat = cartTotal * 0.1;
  const totalAmount = cartTotal + vat;

  const formatMoney = (num: number) => num.toLocaleString('vi-VN') + 'đ';

  
    const handleDeleteItem = (item: any) => {
        const confirmDelete = () => removeFromCart(item.id, item.type, item.memberId);

    if (Platform.OS === 'web') {
        
        if (confirm(`Bạn có chắc muốn xóa "${item.name}" không?`)) confirmDelete();
    } else {
        
        Alert.alert(
            "Xác nhận xóa", 
            `Bạn có muốn xóa "${item.name}" khỏi giỏ hàng?`,
            [{ text: "Hủy", style: "cancel" }, { text: "Xóa", style: "destructive", onPress: confirmDelete }]
        );
    }
  };

  
  const handlePayment = async () => {
    if (cart.length === 0) {
        if (Platform.OS === 'web') {
            alert("Giỏ hàng trống\nVui lòng chọn dịch vụ trước khi thanh toán.");
        } else {
            Alert.alert("Giỏ hàng trống", "Vui lòng chọn dịch vụ trước khi thanh toán.");
        }
        return;
    }

    setIsProcessing(true);

    try {
      const response = await api.post('/checkout', {
        cart: cart,
        payment_method: paymentMethod,
        total: totalAmount
      });

      if (response.status === 200) {
        clearCart(); 

        
        if (Platform.OS === 'web') {
            
            alert("✅ Thanh toán thành công!\nCảm ơn bạn đã sử dụng dịch vụ. Hệ thống đã cập nhật thông tin của bạn.");
            router.replace('/profile');
        } else {
            
            Alert.alert(
                "✅ Thanh toán thành công!", 
                "Cảm ơn bạn đã sử dụng dịch vụ. Hệ thống đã cập nhật thông tin của bạn.",
                [{ text: "Về trang chủ", onPress: () => router.replace('/profile') }]
            );
        }
      }

    } catch (error: any) {
      console.log("Checkout Error:", error);
      const msg = error.response?.data?.message || "Có lỗi kết nối đến máy chủ.";
      
      if (Platform.OS === 'web') {
          alert("Thanh toán thất bại ❌\n" + msg);
      } else {
          Alert.alert("Thanh toán thất bại ❌", msg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={[styles.scrollContent, { padding: isSmallPhone ? 12 : 24 }]}>
        
        <View style={styles.header}>
            <Text style={styles.pageTitle}>Thanh toán</Text>
            <Text style={styles.pageSubtitle}>Kiểm tra giỏ hàng và hoàn tất thanh toán</Text>
        </View>

        <View style={[styles.mainLayout, isMobileLayout && { flexDirection: 'column', gap: 16 }]}>
            {}
            <View style={[styles.leftColumn, isMobileLayout && { width: '100%', minWidth: 0, flex: 0 }]}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Giỏ hàng của bạn ({cart.length})</Text>
                    
                    {cart.length === 0 ? (
                        <View style={styles.emptyCartBox}>
                            <MaterialCommunityIcons name="cart-off" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
                            <Text style={styles.emptySub}>Hãy thêm dịch vụ để tiếp tục</Text>
                        </View>
                    ) : (
                        <View style={{marginTop: 10}}>
                            {cart.map((item, index) => (
                                <View key={index} style={styles.cartItem}>
                        <View style={{flex: 1, paddingRight: 10}}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemSub}>
                                            {item.type === 'membership' ? 'Gói thành viên' : 
                                             item.type === 'trainer' ? 'Thuê HLV' : 'Lớp học'} 
                                            {item.quantity && item.quantity > 1 ? ` • ${item.quantity} ngày` : ''}
                                        </Text>
                                        
                                        {}
                                        {item.schedules && item.schedules.length > 0 && (
                                            <View style={{marginTop: 6, gap: 2}}>
                                                {item.schedules.map((schedule, idx) => (
                                                    <Text key={idx} style={styles.scheduleSub}>
                                                        • {schedule}
                                                    </Text>
                                                ))}
                                            </View>
                                        )}

                                        {}
                                        {item.bookedForMember && item.memberName && (
                                            <Text style={styles.memberIndicator}>
                                                👤 Đặt cho: {item.memberName}
                                            </Text>
                                        )}
                                    </View>
                                    
                                    <View style={{alignItems: 'flex-end', gap: 6}}>
                                        <View>
                                            {item.quantity && item.quantity > 1 ? (
                                                <>
                                                    <Text style={styles.itemPrice}>
                                                        {formatMoney(item.price * item.quantity)}
                                                    </Text>
                                                    <Text style={styles.quantityInfo}>
                                                        {formatMoney(item.price)} × {item.quantity}
                                                    </Text>
                                                </>
                                            ) : (
                                                <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
                                            )}
                                        </View>
                                        <Pressable 
                                            onPress={() => handleDeleteItem(item)}
                                            style={({pressed}) => [styles.deleteBtn, pressed && {opacity: 0.5}]}
                                        >
                                            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#ef4444" />
                                            <Text style={styles.deleteText}>Xóa</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>

            {}
            <View style={[styles.rightColumn, isMobileLayout && { width: '100%', minWidth: 0, flex: 0 }]}>
                <View style={styles.summaryCard}>
                    <Text style={styles.cardTitle}>Tổng thanh toán</Text>
                    
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Tạm tính</Text>
                        <Text style={styles.billValue}>{formatMoney(cartTotal)}</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>VAT (10%)</Text>
                        <Text style={styles.billValue}>{formatMoney(vat)}</Text>
                    </View>
                    <View style={[styles.billRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Tổng cộng</Text>
                        <Text style={styles.totalValue}>{formatMoney(totalAmount)}</Text>
                    </View>

                    <View style={styles.divider} />
                    <Text style={styles.methodLabel}>Phương thức thanh toán</Text>

                    {}
                    <Pressable 
                        style={[styles.methodOption, paymentMethod === 'bank_transfer' && styles.methodActive]} 
                        onPress={() => setPaymentMethod('bank_transfer')}
                    >
                        <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                            <MaterialCommunityIcons name="bank-transfer" size={24} color="#334155" />
                            <Text style={styles.methodText}>Chuyển khoản Ngân hàng</Text>
                        </View>
                        {paymentMethod === 'bank_transfer' && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                    </Pressable>

                    {}
                    <Pressable 
                        style={[styles.methodOption, paymentMethod === 'credit_card' && styles.methodActive]} 
                        onPress={() => setPaymentMethod('credit_card')}
                    >
                        <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                            <MaterialCommunityIcons name="credit-card-outline" size={24} color="#334155" />
                            <Text style={styles.methodText}>Thẻ tín dụng / Ghi nợ</Text>
                        </View>
                        {paymentMethod === 'credit_card' && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                    </Pressable>

                    {}
                    <Pressable 
                        style={[styles.methodOption, paymentMethod === 'cash' && styles.methodActive]} 
                        onPress={() => setPaymentMethod('cash')}
                    >
                        <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
                            <MaterialCommunityIcons name="cash" size={24} color="#334155" />
                            <Text style={styles.methodText}>Tiền mặt tại quầy</Text>
                        </View>
                        {paymentMethod === 'cash' && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                    </Pressable>

                    {}
                    <Pressable 
                        style={[styles.payBtn, (cart.length === 0 || isProcessing) && styles.payBtnDisabled]}
                        disabled={cart.length === 0 || isProcessing}
                        onPress={handlePayment}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.payBtnText}>
                                {paymentMethod === 'bank_transfer' ? 'Đặt hàng & Chuyển khoản' : 'Xác nhận thanh toán'}
                            </Text>
                        )}
                    </Pressable>
                    
                    <Text style={styles.termText}>
                        Bằng việc thanh toán, bạn đồng ý với các điều khoản dịch vụ của phòng gym.
                    </Text>
                </View>
            </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: UI.colors.bg },
  scrollContent: { padding: 24, paddingBottom: 50 },
  header: { marginBottom: 24, maxWidth: 1200, alignSelf: 'center', width: '100%' },
    pageTitle: { fontSize: 30, fontWeight: '800', color: UI.colors.text, fontFamily: UI.font.heading },
    pageSubtitle: { fontSize: 14, color: UI.colors.textMuted, marginTop: 4, fontFamily: UI.font.body },
  mainLayout: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, maxWidth: 1200, alignSelf: 'center', width: '100%' },
    leftColumn: { flex: 2, minWidth: 300 },
    rightColumn: { flex: 1, minWidth: 280 },
        card: { backgroundColor: UI.colors.surface, borderRadius: UI.radius.lg, padding: 16, borderWidth: 1, borderColor: UI.colors.border, ...UI.shadow.card, marginBottom: 24 },
    cardTitle: { fontSize: 19, fontWeight: '700', color: UI.colors.text, marginBottom: 16, fontFamily: UI.font.heading },
  emptyCartBox: { alignItems: 'center', paddingVertical: 40 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: UI.colors.textMuted, marginTop: 16, fontFamily: UI.font.body },
    emptySub: { fontSize: 13, color: '#94a3b8', marginTop: 4, fontFamily: UI.font.body },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'flex-start' },
    itemName: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 4, fontFamily: UI.font.heading },
    itemSub: { fontSize: 13, color: UI.colors.textMuted, fontFamily: UI.font.body },
  scheduleSub: { fontSize: 12, color: '#7c3aed', marginTop: 2 },
  quantityInfo: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    itemPrice: { fontSize: 15, fontWeight: '700', color: UI.colors.primary, fontFamily: UI.font.heading },
    memberIndicator: { fontSize: 12, color: '#059669', fontWeight: '600', marginTop: 6, backgroundColor: '#d1fae5', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 4, padding: 4 },
  deleteText: { fontSize: 12, color: '#ef4444', fontWeight: '600', marginLeft: 4 },
        summaryCard: { backgroundColor: UI.colors.surface, borderRadius: UI.radius.lg, padding: 16, borderWidth: 1, borderColor: UI.colors.border, ...UI.shadow.card },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    billLabel: { color: UI.colors.textMuted, fontSize: 14, fontFamily: UI.font.body },
    billValue: { color: UI.colors.text, fontSize: 14, fontWeight: '600', fontFamily: UI.font.body },
  totalRow: { marginTop: 8 },
    totalLabel: { fontSize: 16, fontWeight: '700', color: UI.colors.text, fontFamily: UI.font.heading },
    totalValue: { fontSize: 20, fontWeight: '800', color: UI.colors.primary, fontFamily: UI.font.heading },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 20 },
    methodLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 12, fontFamily: UI.font.body },
    methodOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, marginBottom: 10, backgroundColor: '#fff' },
    methodActive: { borderColor: UI.colors.primary, backgroundColor: '#e6fffa' },
    methodText: { fontSize: 14, color: '#334155', fontWeight: '600', fontFamily: UI.font.body },
    payBtn: { backgroundColor: UI.colors.primary, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  payBtnDisabled: { backgroundColor: '#cbd5e1' },
    payBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, fontFamily: UI.font.heading },
    termText: { textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 12, paddingHorizontal: 10, fontFamily: UI.font.body },
});

