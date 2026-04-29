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

type BookingClass = {
  class_name: string;
  schedule: string;
  status: string;
};

type BookingTrainer = {
  trainer_name: string;
  schedule_info: string;
  status: string;
};

type HistoryPayload = {
  classes?: BookingClass[];
  trainers?: BookingTrainer[];
};

const ITEMS_PER_PAGE = 6;

export default function BookingHistoryScreen() {
  const router = useRouter();
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);

  const [data, setData] = useState<HistoryPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classPage, setClassPage] = useState(1);
  const [trainerPage, setTrainerPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/user/history');
      setData(res.data || {});
    } catch (error: any) {
      console.log('Lỗi tải lịch đã đặt:', error?.response?.status, error?.response?.data || error?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const classes = useMemo(() => data?.classes || [], [data]);
  const trainers = useMemo(() => data?.trainers || [], [data]);

  const pagedClasses = useMemo(
    () => classes.slice((classPage - 1) * ITEMS_PER_PAGE, classPage * ITEMS_PER_PAGE),
    [classes, classPage]
  );
  const pagedTrainers = useMemo(
    () => trainers.slice((trainerPage - 1) * ITEMS_PER_PAGE, trainerPage * ITEMS_PER_PAGE),
    [trainers, trainerPage]
  );

  const classMaxPage = Math.max(1, Math.ceil(classes.length / ITEMS_PER_PAGE));
  const trainerMaxPage = Math.max(1, Math.ceil(trainers.length / ITEMS_PER_PAGE));

  const statusColor = (status: string) => {
    if (status === 'confirmed' || status === 'completed') return '#16a34a';
    if (status === 'rejected') return '#dc2626';
    return '#ca8a04';
  };

  const statusLabel = (status: string) => {
    if (status === 'confirmed') return 'Đã xác nhận';
    if (status === 'completed') return 'Hoàn thành';
    if (status === 'rejected') return 'Từ chối';
    if (status === 'pending') return 'Chờ duyệt';
    return status;
  };

  if (loading) {
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
      >
        <View style={styles.pageHead}>
          <Pressable style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]}>Quay lại hồ sơ</Text>
          </Pressable>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Lịch đã đặt của bạn</Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.sectionHead}>
            <MaterialCommunityIcons name="calendar-check-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Lịch tập đã đặt</Text>
          </View>

          {pagedClasses.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Bạn chưa đặt lớp tập nào.</Text>
          ) : (
            pagedClasses.map((item, idx) => (
              <View key={`c-${idx}`} style={[styles.rowCard, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
                <View style={styles.rowMain}>
                  <MaterialCommunityIcons name="yoga" size={20} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>{item.class_name}</Text>
                    <Text style={[styles.rowSub, { color: colors.textMuted }]}>{item.schedule}</Text>
                  </View>
                </View>
                <Text style={[styles.status, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
              </View>
            ))
          )}

          {classes.length > ITEMS_PER_PAGE && (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageBtn, classPage === 1 && styles.pageBtnDisabled]}
                disabled={classPage === 1}
                onPress={() => setClassPage((p) => Math.max(1, p - 1))}
              >
                <Text style={styles.pageBtnText}>Trước</Text>
              </Pressable>
              <Text style={[styles.pageInfo, { color: colors.text }]}>Trang {classPage}/{classMaxPage}</Text>
              <Pressable
                style={[styles.pageBtn, classPage >= classMaxPage && styles.pageBtnDisabled]}
                disabled={classPage >= classMaxPage}
                onPress={() => setClassPage((p) => Math.min(classMaxPage, p + 1))}
              >
                <Text style={styles.pageBtnText}>Sau</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.sectionHead}>
            <MaterialCommunityIcons name="account-tie-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Huấn luyện viên đã đặt</Text>
          </View>

          {pagedTrainers.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Bạn chưa đặt huấn luyện viên nào.</Text>
          ) : (
            pagedTrainers.map((item, idx) => (
              <View key={`t-${idx}`} style={[styles.rowCard, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
                <View style={styles.rowMain}>
                  <MaterialCommunityIcons name="account-tie" size={20} color="#e11d48" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: colors.text }]}>{item.trainer_name}</Text>
                    <Text style={[styles.rowSub, { color: colors.textMuted }]}>{item.schedule_info}</Text>
                  </View>
                </View>
                <Text style={[styles.status, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
              </View>
            ))
          )}

          {trainers.length > ITEMS_PER_PAGE && (
            <View style={styles.pagination}>
              <Pressable
                style={[styles.pageBtn, trainerPage === 1 && styles.pageBtnDisabled]}
                disabled={trainerPage === 1}
                onPress={() => setTrainerPage((p) => Math.max(1, p - 1))}
              >
                <Text style={styles.pageBtnText}>Trước</Text>
              </Pressable>
              <Text style={[styles.pageInfo, { color: colors.text }]}>Trang {trainerPage}/{trainerMaxPage}</Text>
              <Pressable
                style={[styles.pageBtn, trainerPage >= trainerMaxPage && styles.pageBtnDisabled]}
                disabled={trainerPage >= trainerMaxPage}
                onPress={() => setTrainerPage((p) => Math.min(trainerMaxPage, p + 1))}
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
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800', fontFamily: UI.font.heading },

  rowCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  rowTitle: { fontSize: 15, fontWeight: '700', fontFamily: UI.font.body },
  rowSub: { fontSize: 13, fontFamily: UI.font.body },
  status: { fontSize: 12, fontWeight: '700', fontFamily: UI.font.body },

  emptyText: { fontSize: 14, fontStyle: 'italic', fontFamily: UI.font.body },

  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 6 },
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