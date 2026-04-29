import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Alert
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { UI } from '../../src/ui/design';
import Reveal from '../../components/ui/Reveal';

export default function DashboardScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/dashboard-stats');
      setData(res.data);
    } catch (error) {
      console.log('Lỗi lấy thống kê:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleReset = () => {
    const confirmMessage = "Hệ thống sẽ tính toán lại toàn bộ dữ liệu cho 12 tháng dựa trên lịch sử giao dịch thực tế.";
    
    const executeReset = async () => {
        try {
            setLoading(true);
            await api.post('/dashboard-reset');
            await fetchStats();
            
            if (Platform.OS !== 'web') {
                Alert.alert("Đã cập nhật", "Dữ liệu 12 tháng đã được làm mới.");
            } else {
                alert("Đã cập nhật dữ liệu 12 tháng.");
            }
        } catch (error) {
            console.log("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    if (Platform.OS === 'web') {
        if (confirm(confirmMessage)) executeReset();
    } else {
        Alert.alert("Cập nhật dữ liệu", confirmMessage, [{ text: "Hủy", style: "cancel" }, { text: "Đồng ý", onPress: executeReset }]);
    }
  };

  const formatMoney = (num: any) => {
    const value = Number(num);
    if (isNaN(value)) return "0";
    return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VNĐ';
  };

  const renderStatCard = (title: string, value: string | number, sub: string, color: string, icon: any, bg: string) => (
    <View style={[styles.statCard, { backgroundColor: bg, borderColor: color }]}>
       <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <View>
             <Text style={styles.cardLabel}>{title}</Text>
             <Text style={styles.cardValue}>{value}</Text>
             <Text style={styles.cardSub}>{sub}</Text>
          </View>
          <View style={[styles.iconBox, {backgroundColor: 'rgba(255,255,255,0.6)'}]}>
             <MaterialCommunityIcons name={icon} size={24} color={color} />
          </View>
       </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={UI.colors.bg} />
      
      {loading || !data ? (
        <View style={styles.centerLoad}><ActivityIndicator size="large" color="#2563eb" /></View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {}
          <Reveal delay={20}>
          <View style={styles.header}>
            <View>
                <Text style={styles.pageTitle}>Tổng quan năm {new Date().getFullYear()}</Text>
                <Text style={styles.pageSubtitle}>Số liệu tự động cập nhật theo thời gian thực</Text>
            </View>
            <Pressable style={styles.resetBtn} onPress={handleReset}>
                <Ionicons name="sync" size={16} color="#fff" style={{marginRight: 6}} />
                <Text style={styles.resetBtnText}>Cập nhật</Text>
            </Pressable>
          </View>
          </Reveal>

          <Reveal delay={90}>
          <View style={styles.cardsContainer}>
             {renderStatCard('Doanh thu tháng này', formatMoney(data.current_month.revenue), 'Thực tế', '#16a34a', 'currency-usd', '#dcfce7')}
             {renderStatCard('Tổng hội viên', data.current_month.total_members, 'Đang hoạt động', '#2563eb', 'account-group', '#dbeafe')}
             {renderStatCard('Hội viên mới tháng này', data.current_month.new_members, 'Người', '#ca8a04', 'account-plus', '#fef9c3')}
          </View>
          </Reveal>

          <Reveal delay={150}>
          <View style={styles.blueCard}>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 8}}>
                    <Text style={styles.blueTitle}>Tiến độ tháng hiện tại</Text>
                    <Text style={styles.blueValue}>{data.current_month.progress.toFixed(1)}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, {width: `${Math.min(data.current_month.progress, 100)}%`}]} />
                </View>
                <Text style={[styles.blueLabel, {marginTop: 6}]}>Mục tiêu: {formatMoney(data.current_month.target)}</Text>
          </View>
                  </Reveal>

                  <Reveal delay={220}>
                  <View style={styles.tableSection}>
            <Text style={styles.sectionTitle}>Chi tiết 12 Tháng</Text>
            <View style={styles.tableHeader}>
                <Text style={[styles.colMonth, styles.headText]}>Tháng</Text>
                <Text style={[styles.colRevenue, styles.headText]}>Doanh thu</Text>
                <Text style={[styles.colNew, styles.headText]}>Hội viên mới</Text>
            </View>
            
            {data.monthly_stats.map((item: any, index: number) => {
                const isCurrentMonth = index + 1 === new Date().getMonth() + 1;
                return (
                    <View key={index} style={[styles.tableRow, isCurrentMonth && styles.activeRow]}>
                        <View style={styles.colMonth}>
                            <Text style={[styles.cellText, isCurrentMonth && styles.activeText]}>Tháng {item.month}</Text>
                            {isCurrentMonth && <View style={styles.nowBadge}><Text style={styles.nowText}>Hiện tại</Text></View>}
                        </View>
                        <Text style={[styles.colRevenue, styles.cellText, styles.moneyText, isCurrentMonth && styles.activeText]}>
                            {formatMoney(item.revenue)}
                        </Text>
                        <Text style={[styles.colNew, styles.cellText, isCurrentMonth && styles.activeText]}>
                            +{item.new_members}
                        </Text>
                    </View>
                );
            })}
          </View>
          </Reveal>

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.colors.bg },
  centerLoad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 50, maxWidth: 1400, marginHorizontal: 'auto', width: '100%' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pageTitle: { fontSize: 30, fontWeight: '800', color: UI.colors.text, fontFamily: UI.font.heading },
  pageSubtitle: { fontSize: 13, color: UI.colors.textMuted, marginTop: 4, fontFamily: UI.font.body },
  resetBtn: { flexDirection: 'row', backgroundColor: UI.colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  resetBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: UI.font.body },

  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { minWidth: 300, flex: 1, borderRadius: 14, padding: 16, borderWidth: 1, ...UI.shadow.card },
  cardLabel: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: '600', fontFamily: UI.font.body },
  cardValue: { fontSize: 24, fontWeight: '800', color: UI.colors.text, marginBottom: 2, fontFamily: UI.font.heading },
  cardSub: { fontSize: 12, color: UI.colors.textMuted, fontFamily: UI.font.body },
  iconBox: { padding: 8, borderRadius: 8 },

  blueCard: { backgroundColor: UI.colors.primaryDark, borderRadius: 14, padding: 16, marginBottom: 24, elevation: 3 },
  blueTitle: { fontSize: 15, fontWeight: '700', color: '#fff', fontFamily: UI.font.body },
  blueValue: { fontSize: 16, fontWeight: '800', color: '#fff', fontFamily: UI.font.heading },
  blueLabel: { fontSize: 12, color: '#dbeafe', textAlign: 'right', fontFamily: UI.font.body },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },

  
  tableSection: { backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 2, borderWidth: 1, borderColor: UI.colors.border },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: UI.colors.text, marginBottom: 12, fontFamily: UI.font.heading },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8, marginBottom: 8 },
  headText: { fontSize: 13, fontWeight: '700', color: '#64748b', fontFamily: UI.font.body },
  tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  activeRow: { backgroundColor: '#ecfeff', borderRadius: 8, paddingHorizontal: 8, marginHorizontal: -8 }, 
  cellText: { fontSize: 14, color: '#334155', fontWeight: '500', fontFamily: UI.font.body },
  activeText: { color: UI.colors.primaryDark, fontWeight: '700' },
  moneyText: { fontWeight: '600' },
  
  colMonth: { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 8 },
  colRevenue: { flex: 2, textAlign: 'right' },
  colNew: { flex: 1, textAlign: 'right' },

  nowBadge: { backgroundColor: UI.colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  nowText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

