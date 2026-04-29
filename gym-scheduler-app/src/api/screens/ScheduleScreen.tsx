import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Pressable, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Hoặc 'react-native-vector-icons/Ionicons'
import { api } from '../client'; // Import axios instance của bạn

// 1. Định nghĩa kiểu dữ liệu (TypeScript) cho khớp với Database Laravel
interface GymClass {
  id: number;
  name: string;
  trainer_name: string; // Lưu ý: Database trả về snake_case
  time: string;         // VD: "06:00 AM"
  duration: number;     // VD: 60
  location: string;
  price: number;
  days: string;
  registered: number;
  capacity: number;
}

const ScheduleScreen = () => {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 2. Hàm format tiền tệ (VND)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // 3. Gọi API lấy danh sách
  const fetchClasses = async () => {
    try {
      const res = await api.get('/gym-classes'); // Gọi vào API bạn vừa viết ở GymClassController
      setClasses(res.data);
    } catch (error) {
      console.log('Lỗi tải lớp:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // 4. Hàm Pull-to-Refresh (Vuốt xuống để tải lại)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClasses();
  }, []);

  // 5. Giao diện từng thẻ (Card) lớp học
  const renderItem = ({ item }: { item: GymClass }) => (
    <View style={styles.card}>
      {/* Header Card: Tên lớp & Giá */}
      <View style={styles.cardHeader}>
        <Text style={styles.className}>{item.name}</Text>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
      </View>

      {/* Thông tin chi tiết */}
      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={18} color="#64748b" />
        <Text style={styles.infoText}>
          {item.time} ({item.duration} phút)
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={18} color="#64748b" />
        <Text style={styles.infoText}>Lịch: {item.days}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="person-outline" size={18} color="#64748b" />
        <Text style={styles.infoText}>HLV: {item.trainer_name}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={18} color="#64748b" />
        <Text style={styles.infoText}>Phòng: {item.location}</Text>
      </View>

      {/* Footer Card: Số chỗ & Nút đăng ký */}
      <View style={styles.cardFooter}>
        <Text style={styles.capacityText}>
          Đã đăng ký: <Text style={{fontWeight: 'bold'}}>{item.registered}/{item.capacity}</Text>
        </Text>
        
        <Pressable 
          style={styles.btnBook} 
          onPress={() => Alert.alert('Thông báo', `Bạn đã chọn lớp ${item.name}`)}
        >
          <Text style={styles.btnBookText}>Đăng ký ngay</Text>
        </Pressable>
      </View>
    </View>
  );

  // 6. Màn hình chính
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Lịch Tập Lớp</Text>
      
      <FlatList
        data={classes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có lớp học nào.</Text>
        }
      />
    </View>
  );
};

// 7. Styles (React Native 0.76 hỗ trợ gap trong Flexbox rất tốt)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Màu nền nhẹ
    paddingTop: 50, // Tránh tai thỏ
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // Đổ bóng (Shadow)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, // Android shadow
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb', // Màu xanh chủ đạo
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8, // Tính năng mới của RN hiện đại, thay vì marginLeft
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  capacityText: {
    fontSize: 13,
    color: '#64748b',
  },
  btnBook: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnBookText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#94a3b8',
  },
});

export default ScheduleScreen;