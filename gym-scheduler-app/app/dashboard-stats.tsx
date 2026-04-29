import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../src/api/client';
import { UI, getThemeColors } from '../src/ui/design';
import { useThemeMode } from '../src/ui/theme-mode';

type MonthlyStat = {
  month: number;
  revenue: number;
  new_members: number;
};

type DashboardPayload = {
  current_month?: {
    revenue?: number;
    total_members?: number;
    new_members?: number;
    target?: number;
    progress?: number;
  };
  monthly_stats?: MonthlyStat[];
};

export default function DashboardStatsScreen() {
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);

  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/dashboard-stats');
      setData(res.data || null);
    } catch (error: any) {
      console.log('Dashboard stats load error:', error?.response?.data || error?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const money = (value: number | undefined) => Number(value || 0).toLocaleString('vi-VN');

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={[styles.title, { color: colors.text }]}>Dashboard stats</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Thong ke dung chung cho moi role</Text>

        <View style={styles.topCards}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="cash-multiple" size={20} color={colors.primary} />
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Doanh thu thang</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{money(data?.current_month?.revenue)} VND</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="account-group-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Tong hoi vien</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{Number(data?.current_month?.total_members || 0)}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="account-plus-outline" size={20} color={colors.primary} />
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>Hoi vien moi</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{Number(data?.current_month?.new_members || 0)}</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Theo thang</Text>
          {(data?.monthly_stats || []).map((item) => (
            <View key={item.month} style={[styles.row, { borderBottomColor: colors.border }]}> 
              <Text style={[styles.rowText, { color: colors.text }]}>Thang {item.month}</Text>
              <Text style={[styles.rowText, { color: colors.textMuted }]}>{money(item.revenue)} VND</Text>
              <Text style={[styles.rowText, { color: colors.primary }]}>+{item.new_members}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: UI.font.heading,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: UI.font.body,
  },
  topCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    minWidth: 150,
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: UI.font.body,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: UI.font.heading,
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    fontFamily: UI.font.heading,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  rowText: {
    fontSize: 14,
    fontFamily: UI.font.body,
  },
});
