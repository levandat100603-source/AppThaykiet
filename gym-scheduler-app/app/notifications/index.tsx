import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../src/api/client';
import { UI, getThemeColors } from '../../src/ui/design';
import { useThemeMode } from '../../src/ui/theme-mode';

export default function Notifications() {
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (error) {
      console.error('Lỗi tải thông báo:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId?: number) => {
    try {
      await api.post('/notifications/read', {
        notification_id: notificationId || null
      });
      fetchNotifications();
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'calendar-check';
      case 'success': return 'check-circle';
      case 'warning': return 'alert-circle';
      case 'error': return 'close-circle';
      default: return 'information';
    }
  };

  const getBadgePalette = (type: string) => {
    if (type === 'success') {
      return isDark
        ? { bg: '#14532d', fg: '#4ade80' }
        : { bg: '#dcfce7', fg: '#15803d' };
    }
    if (type === 'warning') {
      return isDark
        ? { bg: '#713f12', fg: '#fbbf24' }
        : { bg: '#fef3c7', fg: '#b45309' };
    }
    if (type === 'error') {
      return isDark
        ? { bg: '#7f1d1d', fg: '#f87171' }
        : { bg: '#fee2e2', fg: '#b91c1c' };
    }
    return isDark
      ? { bg: '#1e3a8a', fg: '#60a5fa' }
      : { bg: '#dbeafe', fg: '#1d4ed8' };
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="bell" size={28} color="#3b82f6" />
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Thông báo</Text>
            {unreadCount > 0 && (
              <Text style={[styles.unreadBadge, { color: isDark ? '#60a5fa' : UI.colors.primary, backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' }]}>{unreadCount} chưa đọc</Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <Pressable onPress={() => markAsRead()}>
            <Text style={[styles.markAllButton, { color: isDark ? '#93c5fd' : UI.colors.primaryDark }]}>Đánh dấu tất cả</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-off-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
          </View>
        ) : (
          notifications.map((notification: any) => {
            const palette = getBadgePalette(notification.type);
            return (
            <Pressable
              key={notification.id}
              style={[
                styles.notificationCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                !notification.is_read && [styles.unreadCard, { borderLeftColor: isDark ? '#60a5fa' : UI.colors.primary }]
              ]}
              onPress={() => !notification.is_read && markAsRead(notification.id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: palette.bg }]}>
                <MaterialCommunityIcons 
                  name={getIcon(notification.type)} 
                  size={24} 
                  color={palette.fg}
                />
              </View>
              
              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>{notification.title}</Text>
                  {!notification.is_read && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
                
                <Text style={[styles.notificationMessage, { color: colors.textMuted }]}>{notification.message}</Text>
                
                <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
                  {new Date(notification.created_at).toLocaleString('vi-VN')}
                </Text>
              </View>
            </Pressable>
          );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.colors.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI.colors.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: UI.colors.textMuted,
    fontFamily: UI.font.body,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: UI.colors.text,
    fontFamily: UI.font.heading,
  },
  unreadBadge: {
    fontSize: 12,
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: 'flex-start',
    fontFamily: UI.font.body,
  },
  markAllButton: {
    fontSize: 14,
    color: UI.colors.primaryDark,
    fontWeight: '700',
    fontFamily: UI.font.body,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: UI.colors.textMuted,
    marginTop: 16,
    fontFamily: UI.font.body,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: UI.radius.md,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: UI.colors.border,
    ...UI.shadow.card,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: UI.colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: UI.colors.text,
    flex: 1,
    fontFamily: UI.font.body,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: UI.colors.primary,
  },
  notificationMessage: {
    fontSize: 14,
    color: UI.colors.textMuted,
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: UI.font.body,
  },
  notificationTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: UI.font.body,
  },
});


