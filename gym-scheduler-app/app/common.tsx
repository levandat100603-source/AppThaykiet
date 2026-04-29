import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../src/api/client';
import { UI, getThemeColors } from '../src/ui/design';
import { useThemeMode } from '../src/ui/theme-mode';

type DashboardStats = {
  current_month?: {
    revenue?: number;
    total_members?: number;
    new_members?: number;
  };
};

type UserHistory = {
  classes?: unknown[];
  trainers?: unknown[];
};

export default function CommonFeaturesScreen() {
  const router = useRouter();
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<UserHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.all([
        api.get('/dashboard-stats'),
        api.get('/user/history'),
      ]);
      setStats(statsRes.data || null);
      setHistory(historyRes.data || null);
    } catch (error: any) {
      console.log('Load common features failed:', error?.response?.data || error?.message);
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

  const totalBookedClasses = useMemo(() => history?.classes?.length ?? 0, [history]);
  const totalBookedTrainers = useMemo(() => history?.trainers?.length ?? 0, [history]);

  const quickLinks = [
    { id: 'dashboard-stats', title: 'Dashboard stats', icon: 'chart-line', path: '/dashboard-stats' },
    { id: 'history', title: 'Lich su nguoi dung', icon: 'history', path: '/history' },
    { id: 'bookings', title: 'Booking cua toi', icon: 'calendar-check-outline', path: '/profile/bookings' },
    { id: 'notifications', title: 'Thong bao', icon: 'bell-outline', path: '/notifications' },
    { id: 'profile', title: 'Ho so ca nhan', icon: 'account-circle-outline', path: '/profile' },
    { id: 'checkout', title: 'Thanh toan / Checkout', icon: 'cart-outline', path: '/checkout' },
    { id: 'help', title: 'Tro giup va ho tro', icon: 'help-circle-outline', path: '/help' },
    { id: 'about', title: 'Ve chung toi', icon: 'information-outline', path: '/about' },
  ];

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
        <Text style={[styles.title, { color: colors.text }]}>Tinh nang chung</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Dung duoc cho member, trainer va admin</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Booking lop</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalBookedClasses}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Booking HLV</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalBookedTrainers}</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Doanh thu thang</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{Number(stats?.current_month?.revenue || 0).toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        <View style={styles.linkList}>
          {quickLinks.map((link) => (
            <Pressable
              key={link.id}
              style={[styles.linkItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(link.path as any)}
            >
              <View style={styles.linkLeft}>
                <MaterialCommunityIcons name={link.icon as any} size={20} color={colors.primary} />
                <Text style={[styles.linkText, { color: colors.text }]}>{link.title}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
            </Pressable>
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statCard: {
    flexGrow: 1,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: UI.font.body,
  },
  statValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: UI.font.heading,
  },
  linkList: {
    marginTop: 8,
    gap: 10,
  },
  linkItem: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: UI.font.body,
  },
});
