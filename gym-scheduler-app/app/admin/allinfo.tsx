import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { useAuth } from '../../src/api/context/AuthContext';
import { UI } from '../../src/ui/design';
import Reveal from '../../components/ui/Reveal';

type ViewMode = 'overview' | 'data';
type GroupKey = 'core' | 'trainer' | 'member' | 'marketing' | 'finance';
type FieldType = 'text' | 'money' | 'date' | 'bool' | 'json';

type TableField = {
  key: string;
  label: string;
  type?: FieldType;
};

type TableConfig = {
  key: string;
  title: string;
  description: string;
  fields: TableField[];
};

type GroupConfig = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  tables: TableConfig[];
};

const GROUPS: Record<GroupKey, GroupConfig> = {
  core: {
    label: 'Cơ bản',
    icon: 'view-dashboard-outline',
    tables: [
      {
        key: 'classes',
        title: 'Lớp tập',
        description: 'Danh sách lớp học đang có trong hệ thống.',
        fields: [
          { key: 'name', label: 'Tên lớp' },
          { key: 'trainer_name', label: 'HLV' },
          { key: 'time', label: 'Giờ' },
          { key: 'location', label: 'Địa điểm' },
          { key: 'capacity', label: 'Sức chứa' },
          { key: 'registered', label: 'Đã đăng ký' },
          { key: 'price', label: 'Giá', type: 'money' },
          { key: 'created_at', label: 'Tạo lúc', type: 'date' },
        ],
      },
      {
        key: 'trainers',
        title: 'HLV',
        description: 'Thông tin huấn luyện viên và giá buổi tập.',
        fields: [
          { key: 'name', label: 'Tên' },
          { key: 'email', label: 'Email' },
          { key: 'spec', label: 'Chuyên môn' },
          { key: 'exp', label: 'Kinh nghiệm' },
          { key: 'rating', label: 'Đánh giá' },
          { key: 'price', label: 'Giá', type: 'money' },
          { key: 'availability', label: 'Thời gian' },
        ],
      },
      {
        key: 'packages',
        title: 'Gói tập',
        description: 'Các gói thành viên đang kích hoạt.',
        fields: [
          { key: 'name', label: 'Tên gói' },
          { key: 'duration', label: 'Thời hạn' },
          { key: 'price', label: 'Giá', type: 'money' },
          { key: 'benefits', label: 'Quyền lợi' },
          { key: 'color', label: 'Màu' },
          { key: 'status', label: 'Trạng thái' },
        ],
      },
      {
        key: 'members',
        title: 'Thành viên',
        description: 'Danh sách hội viên và trạng thái gói.',
        fields: [
          { key: 'name', label: 'Tên' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'SĐT' },
          { key: 'pack', label: 'Gói' },
          { key: 'start', label: 'Bắt đầu', type: 'date' },
          { key: 'end', label: 'Hết hạn', type: 'date' },
          { key: 'price', label: 'Giá', type: 'money' },
          { key: 'status', label: 'Trạng thái' },
        ],
      },
      {
        key: 'trainer_schedules',
        title: 'Lịch làm HLV',
        description: 'Khung giờ làm việc đã đăng ký của huấn luyện viên.',
        fields: [
          { key: 'trainer_name', label: 'HLV' },
          { key: 'day_of_week', label: 'Ngày' },
          { key: 'start_time', label: 'Bắt đầu' },
          { key: 'end_time', label: 'Kết thúc' },
          { key: 'is_active', label: 'Hoạt động', type: 'bool' },
        ],
      },
      {
        key: 'available_users',
        title: 'Người dùng sẵn sàng',
        description: 'User chưa gắn với member để tạo nhanh.',
        fields: [
          { key: 'name', label: 'Tên' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'SĐT' },
        ],
      },
    ],
  },
  trainer: {
    label: 'HLV',
    icon: 'account-tie-outline',
    tables: [
      {
        key: 'working_hours',
        title: 'Working hours',
        description: 'Giờ làm việc của HLV.',
        fields: [
          { key: 'trainer_id', label: 'Trainer ID' },
          { key: 'day_of_week', label: 'Ngày' },
          { key: 'start_time', label: 'Bắt đầu' },
          { key: 'end_time', label: 'Kết thúc' },
          { key: 'is_active', label: 'Hoạt động', type: 'bool' },
        ],
      },
      {
        key: 'time_offs',
        title: 'Time offs',
        description: 'Ngày nghỉ của HLV.',
        fields: [
          { key: 'trainer_id', label: 'Trainer ID' },
          { key: 'start_date', label: 'Từ', type: 'date' },
          { key: 'end_date', label: 'Đến', type: 'date' },
          { key: 'reason', label: 'Lý do' },
          { key: 'status', label: 'Trạng thái' },
        ],
      },
      {
        key: 'session_notes',
        title: 'Session notes',
        description: 'Ghi chú buổi tập của HLV.',
        fields: [
          { key: 'booking_id', label: 'Booking ID' },
          { key: 'trainer_id', label: 'Trainer ID' },
          { key: 'member_id', label: 'Member ID' },
          { key: 'performance', label: 'Hiệu suất' },
          { key: 'created_at', label: 'Tạo lúc', type: 'date' },
        ],
      },
      {
        key: 'workout_plans',
        title: 'Workout plans',
        description: 'Kế hoạch tập luyện theo thành viên.',
        fields: [
          { key: 'trainer_id', label: 'Trainer ID' },
          { key: 'member_id', label: 'Member ID' },
          { key: 'title', label: 'Tiêu đề' },
          { key: 'difficulty', label: 'Độ khó' },
          { key: 'duration', label: 'Tuần' },
        ],
      },
      {
        key: 'trainer_earnings',
        title: 'Trainer earnings',
        description: 'Doanh thu và số liệu hoa hồng của HLV.',
        fields: [
          { key: 'trainer_id', label: 'Trainer ID' },
          { key: 'total_earnings', label: 'Tổng', type: 'money' },
          { key: 'withdrawal_balance', label: 'Số dư', type: 'money' },
          { key: 'completed_sessions', label: 'Hoàn thành' },
          { key: 'pending_sessions', label: 'Chờ xử lý' },
          { key: 'cancelled_sessions', label: 'Đã hủy' },
          { key: 'commission_rate', label: 'Hoa hồng' },
        ],
      },
    ],
  },
  member: {
    label: 'Thành viên',
    icon: 'account-group-outline',
    tables: [
      {
        key: 'waitlist_entries',
        title: 'Waitlist entries',
        description: 'Danh sách chờ đăng ký lớp/HLV.',
        fields: [
          { key: 'member_id', label: 'Member ID' },
          { key: 'item_type', label: 'Loại' },
          { key: 'item_id', label: 'Item ID' },
          { key: 'position', label: 'Vị trí' },
          { key: 'notified_at', label: 'Đã thông báo', type: 'date' },
        ],
      },
      {
        key: 'membership_freezes',
        title: 'Membership freezes',
        description: 'Yêu cầu tạm dừng hội viên.',
        fields: [
          { key: 'member_id', label: 'Member ID' },
          { key: 'start_date', label: 'Từ', type: 'date' },
          { key: 'end_date', label: 'Đến', type: 'date' },
          { key: 'reason', label: 'Lý do' },
          { key: 'status', label: 'Trạng thái' },
        ],
      },
      {
        key: 'member_cards',
        title: 'Member cards',
        description: 'Thẻ QR check-in của hội viên.',
        fields: [
          { key: 'member_id', label: 'Member ID' },
          { key: 'card_number', label: 'Số thẻ' },
          { key: 'is_active', label: 'Kích hoạt', type: 'bool' },
        ],
      },
      {
        key: 'booking_cancellations',
        title: 'Booking cancellations',
        description: 'Lịch bị hủy và tiền hoàn.',
        fields: [
          { key: 'booking_id', label: 'Booking ID' },
          { key: 'member_id', label: 'Member ID' },
          { key: 'refund_amount', label: 'Hoàn tiền', type: 'money' },
          { key: 'penalty', label: 'Phạt', type: 'money' },
          { key: 'status', label: 'Trạng thái' },
        ],
      },
      {
        key: 'pending_registrations',
        title: 'Pending registrations',
        description: 'Đăng ký chưa xác thực email.',
        fields: [
          { key: 'name', label: 'Tên' },
          { key: 'email', label: 'Email' },
          { key: 'verification_code', label: 'Mã' },
          { key: 'code_expires_at', label: 'Hết hạn', type: 'date' },
          { key: 'verified_at', label: 'Đã xác thực', type: 'date' },
        ],
      },
    ],
  },
  marketing: {
    label: 'Marketing',
    icon: 'bullhorn-outline',
    tables: [
      {
        key: 'vouchers',
        title: 'Vouchers',
        description: 'Mã giảm giá và trạng thái kích hoạt.',
        fields: [
          { key: 'code', label: 'Mã' },
          { key: 'discount_type', label: 'Loại' },
          { key: 'discount_value', label: 'Giảm', type: 'money' },
          { key: 'valid_until', label: 'Hạn', type: 'date' },
          { key: 'is_active', label: 'Hoạt động', type: 'bool' },
        ],
      },
      {
        key: 'push_campaigns',
        title: 'Push campaigns',
        description: 'Chiến dịch thông báo đẩy.',
        fields: [
          { key: 'title', label: 'Tiêu đề' },
          { key: 'target_audience', label: 'Đối tượng' },
          { key: 'status', label: 'Trạng thái' },
          { key: 'recipient_count', label: 'Người nhận' },
          { key: 'success_count', label: 'Thành công' },
          { key: 'send_at', label: 'Lên lịch', type: 'date' },
        ],
      },
    ],
  },
  finance: {
    label: 'Tài chính',
    icon: 'cash-multiple',
    tables: [
      {
        key: 'refund_requests',
        title: 'Refund requests',
        description: 'Yêu cầu hoàn tiền của thành viên.',
        fields: [
          { key: 'booking_id', label: 'Booking ID' },
          { key: 'member_id', label: 'Member ID' },
          { key: 'requested_amount', label: 'Yêu cầu', type: 'money' },
          { key: 'approved_amount', label: 'Phê duyệt', type: 'money' },
          { key: 'status', label: 'Trạng thái' },
          { key: 'refund_method', label: 'Phương thức' },
        ],
      },
      {
        key: 'transaction_reports',
        title: 'Transaction reports',
        description: 'Báo cáo giao dịch theo ngày.',
        fields: [
          { key: 'date', label: 'Ngày', type: 'date' },
          { key: 'type', label: 'Loại' },
          { key: 'amount', label: 'Số tiền', type: 'money' },
          { key: 'member_id', label: 'Member ID' },
          { key: 'trainer_id', label: 'Trainer ID' },
        ],
      },
    ],
  },
};

const VIEW_OPTIONS: Array<{ key: ViewMode; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
  { key: 'overview', label: 'Tổng quan', icon: 'chart-box-outline' },
  { key: 'data', label: 'Dữ liệu mở rộng', icon: 'database-outline' },
];

const GROUP_ORDER: GroupKey[] = ['core', 'trainer', 'member', 'marketing', 'finance'];

const formatCurrency = (value: unknown) => {
  const numberValue = Number(value ?? 0);
  if (!Number.isFinite(numberValue)) {
    return '0đ';
  }
  return `${numberValue.toLocaleString('vi-VN')}đ`;
};

const formatCell = (value: unknown, type?: FieldType) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (type === 'money') {
    return formatCurrency(value);
  }

  if (type === 'bool') {
    return value ? 'Có' : 'Không';
  }

  if (type === 'date') {
    const raw = String(value);
    return raw.length > 10 ? raw.replace('T', ' ').slice(0, 16) : raw;
  }

  if (type === 'json') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const renderStatCard = (title: string, value: string | number, sub: string, color: string, icon: keyof typeof MaterialCommunityIcons.glyphMap, bg: string) => (
  <View style={[styles.statCard, { backgroundColor: bg, borderColor: color }]}>
    <View style={styles.statRow}>
      <View>
        <Text style={styles.cardLabel}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardSub}>{sub}</Text>
      </View>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
    </View>
  </View>
);

function DataCard({ title, description, rows, fields }: { title: string; description: string; rows: any[]; fields: TableField[] }) {
  return (
    <View style={styles.dataCard}>
      <View style={styles.dataCardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dataCardTitle}>{title}</Text>
          <Text style={styles.dataCardSubtitle}>{description}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{rows.length} records</Text>
        </View>
      </View>

      {rows.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có dữ liệu.</Text>
      ) : (
        <View style={styles.tableContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableInner}>
              <View style={styles.rowHeader}>
                {fields.map((field) => (
                  <View key={field.key} style={styles.tableCellWrapper}>
                    <Text style={[styles.previewLabel, styles.tableHeaderText]} numberOfLines={1}>
                      {field.label}
                    </Text>
                  </View>
                ))}
              </View>

              {rows.slice(0, 5).map((row, index) => (
                <View key={row.id ?? index} style={styles.rowData}>
                  {fields.map((field) => (
                    <View key={field.key} style={styles.tableCellWrapper}>
                      <Text style={styles.previewValue} numberOfLines={2}>
                        {formatCell(row[field.key], field.type)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function DashboardScreen() {
  const { token, isInitializing, user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [group, setGroup] = useState<GroupKey>('core');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [adminData, setAdminData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [newTarget, setNewTarget] = useState('');

  const fetchData = useCallback(async () => {
    if (isInitializing || !token || user?.role !== 'admin') {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const [statsRes, dataRes] = await Promise.all([api.get('/dashboard-stats'), api.get('/admin/data')]);
      setDashboardStats(statsRes.data);
      setAdminData(dataRes.data);
    } catch (error) {
      console.log('Lỗi lấy dữ liệu admin:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isInitializing, token, user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleReset = () => {
    const confirmMessage = 'Hệ thống sẽ tính toán lại toàn bộ dữ liệu cho 12 tháng dựa trên lịch sử giao dịch thực tế.';

    const executeReset = async () => {
      try {
        setLoading(true);
        await api.post('/dashboard-reset');
        await fetchData();

        if (Platform.OS !== 'web') {
          Alert.alert('Đã cập nhật', 'Dữ liệu 12 tháng đã được làm mới.');
        } else {
          alert('Đã cập nhật dữ liệu 12 tháng.');
        }
      } catch (error) {
        console.log('Lỗi:', error);
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(confirmMessage)) executeReset();
    } else {
      Alert.alert('Cập nhật dữ liệu', confirmMessage, [{ text: 'Hủy', style: 'cancel' }, { text: 'Đồng ý', onPress: executeReset }]);
    }
  };

  const handleUpdateTarget = async () => {
    const targetValue = parseFloat(newTarget);
    if (!newTarget || isNaN(targetValue) || targetValue < 0) {
      if (Platform.OS === 'web') {
        alert('Vui lòng nhập số tiền hợp lệ');
      } else {
        Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      }
      return;
    }

    try {
      setLoading(true);
      await api.post('/dashboard/update-target', { target: targetValue });
      await fetchData();
      setShowTargetModal(false);
      setNewTarget('');

      if (Platform.OS === 'web') {
        alert('Đã cập nhật mục tiêu doanh thu thành công');
      } else {
        Alert.alert('Thành công', 'Đã cập nhật mục tiêu doanh thu');
      }
    } catch (error) {
      console.log('Lỗi cập nhật mục tiêu:', error);
      if (Platform.OS === 'web') {
        alert('Lỗi cập nhật mục tiêu doanh thu');
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật mục tiêu doanh thu');
      }
    } finally {
      setLoading(false);
    }
  };

  const currentGroup = GROUPS[group];
  const currentStats = dashboardStats?.current_month ?? { revenue: 0, new_members: 0, total_members: 0, target: 0, progress: 0 };
  const monthlyStats = dashboardStats?.monthly_stats ?? [];
  const activeTables = useMemo(() => currentGroup.tables, [currentGroup.tables]);
  const canAccess = !isInitializing && !!token && user?.role === 'admin';

  if (!isInitializing && !canAccess) {
    return (
      <View style={styles.container}>
        <View style={styles.centerLoad}>
          <Text style={styles.emptyText}>Bạn chưa có quyền truy cập màn quản trị này.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={UI.colors.bg} />

      {loading || !dashboardStats || !adminData ? (
        <View style={styles.centerLoad}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Reveal delay={20}>
            <View style={styles.header}>
              <View>
                <Text style={styles.pageTitle}>Thông tin hệ thống</Text>
                <Text style={styles.pageSubtitle}>Theo dõi nhanh và duyệt dữ liệu mở rộng từ một nơi</Text>
              </View>
              <Pressable style={styles.resetBtn} onPress={handleReset}>
                <Ionicons name="sync" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.resetBtnText}>Cập nhật</Text>
              </Pressable>
            </View>
          </Reveal>

          <Reveal delay={70}>
            <View style={styles.modeTabs}>
              {VIEW_OPTIONS.map((option) => {
                const active = viewMode === option.key;
                return (
                  <Pressable
                    key={option.key}
                    style={[styles.modeTab, active && styles.modeTabActive]}
                    onPress={() => setViewMode(option.key)}
                  >
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={18}
                      color={active ? '#fff' : UI.colors.textMuted}
                    />
                    <Text style={[styles.modeTabText, active && styles.modeTabTextActive]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Reveal>

          {viewMode === 'overview' ? (
            <>
              <Reveal delay={90}>
                <View style={styles.cardsContainer}>
                  {renderStatCard('Doanh thu tháng này', formatCurrency(currentStats.revenue), 'Thực tế', '#16a34a', 'currency-usd', '#dcfce7')}
                  {renderStatCard('Tổng hội viên', currentStats.total_members, 'Đang hoạt động', '#2563eb', 'account-group', '#dbeafe')}
                  {renderStatCard('Hội viên mới tháng này', currentStats.new_members, 'Người', '#ca8a04', 'account-plus', '#fef9c3')}
                </View>
              </Reveal>

              <Reveal delay={150}>
                <View style={styles.blueCard}>
                  <View style={styles.blueRow}>
                    <Text style={styles.blueTitle}>Tiến độ tháng hiện tại</Text>
                    <Text style={styles.blueValue}>{Number(currentStats.progress || 0).toFixed(1)}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${Math.min(Number(currentStats.progress || 0), 100)}%` }]} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <Text style={[styles.blueLabel]}>Mục tiêu: {formatCurrency(currentStats.target)}</Text>
                    <Pressable 
                      style={{ paddingHorizontal: 12, paddingVertical: 6 }}
                      onPress={() => {
                        setNewTarget(currentStats.target.toString());
                        setShowTargetModal(true);
                      }}
                    >
                      <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
                    </Pressable>
                  </View>
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

                  {monthlyStats.map((item: any, index: number) => {
                    const isCurrentMonth = index + 1 === new Date().getMonth() + 1;
                    return (
                      <View key={index} style={[styles.tableRow, isCurrentMonth && styles.activeRow]}>
                        <View style={styles.colMonth}>
                          <Text style={[styles.cellText, isCurrentMonth && styles.activeText]}>Tháng {item.month}</Text>
                          {isCurrentMonth && (
                            <View style={styles.nowBadge}>
                              <Text style={styles.nowText}>Hiện tại</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.colRevenue, styles.cellText, styles.moneyText, isCurrentMonth && styles.activeText]}>
                          {formatCurrency(item.revenue)}
                        </Text>
                        <Text style={[styles.colNew, styles.cellText, isCurrentMonth && styles.activeText]}>+{item.new_members}</Text>
                      </View>
                    );
                  })}
                </View>
              </Reveal>
            </>
          ) : (
            <>
              <Reveal delay={90}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.groupTabs}>
                  {GROUP_ORDER.map((key) => {
                    const active = group === key;
                    const item = GROUPS[key];
                    return (
                      <Pressable
                        key={key}
                        style={[styles.groupTab, active && styles.groupTabActive]}
                        onPress={() => setGroup(key)}
                      >
                        <MaterialCommunityIcons name={item.icon} size={16} color={active ? '#fff' : UI.colors.textMuted} />
                        <Text style={[styles.groupTabText, active && styles.groupTabTextActive]}>{item.label}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </Reveal>

              <Reveal delay={130}>
                <View style={styles.sectionIntro}>
                  <Text style={styles.sectionIntroTitle}>{currentGroup.label}</Text>
                  <Text style={styles.sectionIntroText}>Hiển thị các bảng đã khôi phục và dữ liệu vận hành tương ứng.</Text>
                </View>
              </Reveal>

              <Reveal delay={180}>
                <View style={styles.tableStack}>
                  {activeTables.map((table) => (
                    <DataCard
                      key={table.key}
                      title={table.title}
                      description={table.description}
                      rows={adminData?.[table.key] || []}
                      fields={table.fields}
                    />
                  ))}
                </View>
              </Reveal>
            </>
          )}
        </ScrollView>
      )}

      {/* Target Edit Modal */}
      <Modal
        visible={showTargetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTargetModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 20, width: '100%', maxWidth: 400 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: UI.colors.text, marginBottom: 12 }}>Cập nhật mục tiêu doanh thu</Text>
            <Text style={{ fontSize: 13, color: UI.colors.textMuted, marginBottom: 16 }}>Nhập số tiền mục tiêu cho tháng (VND)</Text>
            
            <View style={{ marginBottom: 20 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#cbd5e1',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 15,
                  color: UI.colors.text,
                }}
                placeholder="50000000"
                placeholderTextColor="#cbd5e1"
                keyboardType="decimal-pad"
                value={newTarget}
                onChangeText={setNewTarget}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: '#f1f5f9',
                }}
                onPress={() => setShowTargetModal(false)}
              >
                <Text style={{ color: UI.colors.textMuted, fontWeight: '600', fontSize: 14 }}>Hủy</Text>
              </Pressable>
              <Pressable
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: UI.colors.primary,
                }}
                onPress={handleUpdateTarget}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Cập nhật</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.colors.bg },
  centerLoad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 50, maxWidth: 1400, marginHorizontal: 'auto', width: '100%' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  pageTitle: { fontSize: 30, fontWeight: '800', color: UI.colors.text, fontFamily: UI.font.heading },
  pageSubtitle: { fontSize: 13, color: UI.colors.textMuted, marginTop: 4, fontFamily: UI.font.body },
  resetBtn: { flexDirection: 'row', backgroundColor: UI.colors.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  resetBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: UI.font.body },

  modeTabs: { flexDirection: 'row', gap: 10, marginBottom: 18, flexWrap: 'wrap' },
  modeTab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#eef2ff', borderWidth: 1, borderColor: '#c7d2fe' },
  modeTabActive: { backgroundColor: UI.colors.primaryDark, borderColor: UI.colors.primaryDark },
  modeTabText: { color: UI.colors.textMuted, fontSize: 13, fontWeight: '700', fontFamily: UI.font.body },
  modeTabTextActive: { color: '#fff' },

  cardsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { minWidth: 300, flex: 1, borderRadius: 14, padding: 16, borderWidth: 1, ...UI.shadow.card },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: '600', fontFamily: UI.font.body },
  cardValue: { fontSize: 24, fontWeight: '800', color: UI.colors.text, marginBottom: 2, fontFamily: UI.font.heading },
  cardSub: { fontSize: 12, color: UI.colors.textMuted, fontFamily: UI.font.body },
  iconBox: { padding: 8, borderRadius: 8 },

  blueCard: { backgroundColor: UI.colors.primaryDark, borderRadius: 14, padding: 16, marginBottom: 24, elevation: 3 },
  blueRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
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

  groupTabs: { flexDirection: 'row', gap: 10, paddingBottom: 10 },
  groupTab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 999, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
  groupTabActive: { backgroundColor: UI.colors.primary, borderColor: UI.colors.primary },
  groupTabText: { color: UI.colors.textMuted, fontSize: 13, fontWeight: '700', fontFamily: UI.font.body },
  groupTabTextActive: { color: '#fff' },

  sectionIntro: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: UI.colors.border, marginBottom: 14 },
  sectionIntroTitle: { fontSize: 20, fontWeight: '800', color: UI.colors.text, fontFamily: UI.font.heading },
  sectionIntroText: { fontSize: 13, color: UI.colors.textMuted, marginTop: 4, fontFamily: UI.font.body },

  tableStack: { gap: 14 },
  dataCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: UI.colors.border, ...UI.shadow.card },
  dataCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  dataCardTitle: { fontSize: 18, fontWeight: '800', color: UI.colors.text, fontFamily: UI.font.heading },
  dataCardSubtitle: { fontSize: 12, color: UI.colors.textMuted, marginTop: 4, fontFamily: UI.font.body },
  countBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  countBadgeText: { color: UI.colors.primaryDark, fontWeight: '800', fontSize: 12, fontFamily: UI.font.body },
  emptyText: { color: UI.colors.textMuted, fontSize: 13, paddingVertical: 8, fontFamily: UI.font.body },
  previewList: { gap: 10 },
  previewItem: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  previewItemHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 10 },
  previewItemTitle: { color: UI.colors.text, fontWeight: '800', fontSize: 14, fontFamily: UI.font.body },
  previewItemMeta: { color: UI.colors.textMuted, fontWeight: '600', fontSize: 12, fontFamily: UI.font.body, textAlign: 'right', flexShrink: 1 },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  previewField: { width: '48%', minWidth: 180 },
  previewLabel: { fontSize: 11, color: UI.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: UI.font.body },
  previewValue: { fontSize: 13, color: UI.colors.text, fontWeight: '700', marginTop: 2, fontFamily: UI.font.body, textAlign: 'left' },
  /* Table styles for aligned columns */
  tableContainer: { overflow: 'hidden' },
  tableInner: { minWidth: 600 },
  rowHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 8, marginBottom: 8, backgroundColor: '#fafafa' },
  rowData: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center' },
  tableCellWrapper: { flex: 1, minWidth: 140, paddingHorizontal: 8 },
  tableHeaderText: { fontSize: 12, fontWeight: '700', color: '#64748b', textAlign: 'left' },
});
