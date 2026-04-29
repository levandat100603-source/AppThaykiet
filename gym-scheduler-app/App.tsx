
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppNavigator from './src/api/navigation/AppNavigator'; 

export default function App() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'pt' | 'membership' | 'cashier'>('schedule');
  const [cartItems, setCartItems] = useState<any[]>([]);

  const addToCart = (item: any) => {
    setCartItems(prev => [...prev, { ...item, id: Date.now() }]);
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f4f7' }}>
      {}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="dumbbell" size={32} color="#fff" />
          <Text style={styles.logo}>FitZone Gym</Text>
        </View>
        <Pressable style={styles.cartBtn} onPress={() => setActiveTab('cashier')}>
          <Ionicons name="cart" size={22} color="#fff" />
          <Text style={styles.cartText}>Giỏ hàng</Text>
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={{ color: '#fff', fontSize: 12 }}>{cartItems.length}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {}
      <View style={styles.menuBar}>
        <TabBtn icon={<Ionicons name="calendar" size={18} color={activeTab==='schedule' ? '#2563eb' : '#6b7280'} />} label="Lịch tập" active={activeTab==='schedule'} onPress={() => setActiveTab('schedule')} />
        <TabBtn icon={<MaterialCommunityIcons name="dumbbell" size={18} color={activeTab==='pt' ? '#2563eb' : '#6b7280'} />} label="Huấn luyện viên" active={activeTab==='pt'} onPress={() => setActiveTab('pt')} />
        <TabBtn icon={<Ionicons name="card" size={18} color={activeTab==='membership' ? '#2563eb' : '#6b7280'} />} label="Thẻ thành viên" active={activeTab==='membership'} onPress={() => setActiveTab('membership')} />
        <TabBtn icon={<Ionicons name="cash" size={18} color={activeTab==='cashier' ? '#2563eb' : '#6b7280'} />} label="Thanh toán" active={activeTab==='cashier'} onPress={() => setActiveTab('cashier')} />
      </View>

      {}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {activeTab === 'schedule' && <ClassSchedule addToCart={addToCart} />}
        {activeTab === 'pt' && <PTBooking addToCart={addToCart} />}
        {activeTab === 'membership' && <Memberships addToCart={addToCart} />}
        {activeTab === 'cashier' && (
          <Cashier cartItems={cartItems} removeFromCart={removeFromCart} clearCart={clearCart} />
        )}
      </ScrollView>
    </View>
  );
}

function TabBtn({ icon, label, active, onPress }: { icon: any, label: string, active: boolean, onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabActive]}>
      {icon}
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}


function ClassSchedule({ addToCart }: any) {
  return (
    <View><Text style={{ fontWeight: 'bold', fontSize: 18 }}>Lịch tập lớp (Demo)</Text></View>
  );
}
function PTBooking({ addToCart }: any) {
  return (
    <View><Text>Huấn luyện viên cá nhân (Demo)</Text></View>
  );
}
function Memberships({ addToCart }: any) {
  return (
    <View><Text>Thẻ thành viên (Demo)</Text></View>
  );
}
function Cashier({ cartItems, removeFromCart, clearCart }: any) {
  return (
    <View><Text>Thanh toán (Demo)</Text></View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  logo: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 24,
    marginLeft: 8,
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1746a2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
  },
  cartText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2563eb',
  },
  tabLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
});


