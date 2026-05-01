import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Platform,
  StatusBar,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useCart } from '../src/api/context/CartContext';
import { useAuth } from '../src/api/context/AuthContext';
import { api } from '../src/api/client';
import { UI, getThemeColors } from '../src/ui/design';
import { useThemeMode } from '../src/ui/theme-mode';

const PUBLIC_TOP_MENU = [
  { id: 'schedules', title: 'Lop hoc', icon: 'calendar-clock', path: '/schedules' },
  { id: 'trainers', title: 'HLV', icon: 'account-tie', path: '/trainers' },
  { id: 'memberships', title: 'Goi tap', icon: 'card-account-details', path: '/memberships' },
];

export default function CustomHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart(); 
  const { user, token, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [adminMenuExpanded, setAdminMenuExpanded] = useState(false);
  const { width, height } = useWindowDimensions();
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);
  const isMobileNav = width < 900;
  const notifPanelWidth = Math.min(320, Math.max(260, width - 24));
  const notifPanelMaxHeight = Math.min(420, Math.max(260, height * 0.65));
  const userWidgetMaxWidth = width < 380 ? 110 : 140;

  const fetchNotifs = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      const data = res.data?.notifications || [];
      const count = res.data?.unread_count || 0;
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(count);
      console.log('📬 Loaded notifications:', data.length, 'items, unread:', count);
    } catch (e: any) {
      console.log('❌ Load notifications error', e?.response?.data || e?.message);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (e: any) => {
      if (e.key === 'Escape') setShowNotif(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  
  useEffect(() => { 
    if (user && token) {
      console.log('👤 User loaded:', user.name, '(with token) - fetching notifications...');
      fetchNotifs(); 
    } else {
      console.log('👤 No user or token, clearing notifications');
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [user, token, fetchNotifs]);

  // Auto-fetch notifications every 10 seconds to keep badge updated
  useEffect(() => {
    if (!user || !token) return;
    const interval = setInterval(() => {
      fetchNotifs();
    }, 10000);
    return () => clearInterval(interval);
  }, [user, token, fetchNotifs]);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e: any) {
      console.log('Mark read error', e?.response?.data || e?.message);
    }
  };

  
  const topMenuItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [
        { id: 'admin-classes', title: 'Lop tap', icon: 'calendar-clock', path: '/admin/classes' },
        { id: 'admin-trainers', title: 'HLV', icon: 'account-tie', path: '/admin/trainers' },
        { id: 'admin-packages', title: 'Goi tap', icon: 'card-account-details', path: '/admin/packages' },
      ];
    }

    if (user?.role === 'trainer') {
      return [
        { id: 'trainer-classes', title: 'Lop cua toi', icon: 'notebook-outline', path: '/schedules' },
        { id: 'trainer-bookings', title: 'Booking', icon: 'clipboard-check-outline', path: '/bookings' },
        { id: 'trainer-availability', title: 'Khung gio', icon: 'clock-time-four-outline', path: '/trainer/availability' },
        { id: 'trainer-earnings', title: 'Thu nhap', icon: 'cash-multiple', path: '/trainer/earnings' },
        { id: 'trainer-profile', title: 'Ho so', icon: 'account-circle-outline', path: '/profile' },
      ];
    }

    if (user?.role === 'member' || user?.role === 'user') {
      return [
        { id: 'member-classes', title: 'Lop hoc', icon: 'calendar-clock', path: '/schedules' },
        { id: 'member-trainers', title: 'HLV', icon: 'account-tie', path: '/trainers' },
        { id: 'member-packages', title: 'Goi tap', icon: 'card-account-details', path: '/memberships' },
        { id: 'member-bookings', title: 'Lich dat', icon: 'calendar-check-outline', path: '/profile/bookings' },
      ];
    }

    return PUBLIC_TOP_MENU;
  }, [user]);

  const drawerMenuItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [
        { id: 'classes', title: 'Danh sach lop tap', icon: 'calendar-clock', path: '/schedules' },
        { id: 'trainers', title: 'Danh sach HLV', icon: 'account-tie', path: '/trainers' },
        { id: 'packages', title: 'Goi tap', icon: 'card-account-details', path: '/memberships' },
        { id: 'checkout', title: 'Thanh toan', icon: 'cart-outline', path: '/checkout' },
        { id: 'profile', title: 'Ho so', icon: 'account-circle-outline', path: '/profile' },
        { id: 'help', title: 'Tro giup va ho tro', icon: 'help-circle-outline', path: '/help' },
        { id: 'about', title: 'Ve chung toi', icon: 'information-outline', path: '/about' },
      ];
    }

    if (user?.role === 'trainer') {
      return [
        { id: 'trainer-classes', title: 'Lớp của tôi', icon: 'notebook-outline', path: '/schedules' },
        { id: 'trainer-bookings', title: 'Booking', icon: 'clipboard-check-outline', path: '/bookings' },
        { id: 'trainer-availability', title: 'Đăng ký lịch làm', icon: 'clock-time-four-outline', path: '/trainer/availability' },
        { id: 'trainer-earnings', title: 'Thu nhập', icon: 'cash-multiple', path: '/trainer/earnings' },
        { id: 'trainer-profile', title: 'Hồ sơ', icon: 'account-circle-outline', path: '/profile' },
      ];
    }

    if (user?.role === 'member' || user?.role === 'user') {
      return [
        { id: 'classes', title: 'Danh sach lop tap', icon: 'calendar-clock', path: '/schedules' },
        { id: 'trainers', title: 'Danh sach HLV', icon: 'account-tie', path: '/trainers' },
        { id: 'packages', title: 'Goi tap', icon: 'card-account-details', path: '/memberships' },
        { id: 'bookings', title: 'Booking cua toi', icon: 'calendar-check-outline', path: '/profile/bookings' },
        { id: 'profile', title: 'Ho so', icon: 'account-circle-outline', path: '/profile' },
        { id: 'checkout', title: 'Gio hang', icon: 'cart-outline', path: '/checkout' },
        { id: 'help', title: 'Tro giup va ho tro', icon: 'help-circle-outline', path: '/help' },
        { id: 'about', title: 'Ve chung toi', icon: 'information-outline', path: '/about' },
      ];
    }

    return [
      { id: 'login', title: 'Dang nhap', icon: 'login', path: '/login' },
      { id: 'help', title: 'Tro giup va ho tro', icon: 'help-circle-outline', path: '/help' },
      { id: 'about', title: 'Ve chung toi', icon: 'information-outline', path: '/about' },
    ];
  }, [user]);

  const adminSubMenuItems = useMemo(
    () => [
      { id: 'admin-classes', title: 'Lớp tập', icon: 'calendar-clock', action: () => router.push({ pathname: '/admin/dashboard', params: { tab: 'classes' } } as any) },
      { id: 'admin-trainers', title: 'HLV', icon: 'account-tie', action: () => router.push({ pathname: '/admin/dashboard', params: { tab: 'trainers' } } as any) },
      { id: 'admin-trainer-schedule', title: 'Lịch làm HLV', icon: 'calendar-clock-outline', action: () => router.push({ pathname: '/admin/dashboard', params: { tab: 'trainer-schedules' } } as any) },
      { id: 'admin-packages', title: 'Gói tập', icon: 'card-account-details', action: () => router.push({ pathname: '/admin/dashboard', params: { tab: 'packages' } } as any) },
      { id: 'admin-members', title: 'Thành viên', icon: 'account-group-outline', action: () => router.push({ pathname: '/admin/dashboard', params: { tab: 'members' } } as any) },
      { id: 'admin-bookings', title: 'Xác nhận lịch', icon: 'clipboard-check-outline', action: () => router.push({ pathname: '/admin/dashboard', params: { tab: 'bookings' } } as any) },
      { id: 'admin-payroll', title: 'Thanh toán lương', icon: 'cash-check', action: () => router.push('/admin/payroll' as any) },
      { id: 'admin-allinfo', title: 'Dữ liệu mở rộng', icon: 'chart-bar', action: () => router.push('/admin/allinfo' as any) },
    ],
    [router]
  );

  const isActive = (path: string) => {
    if (path === '/schedules' && (pathname === '/' || pathname === '/schedules')) return true;
    return pathname.startsWith(path);
  };

  const onLogoutPress = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
      if (confirmed) {
        await logout();
        router.replace('/login');
      }
    } else {
      Alert.alert('Đăng xuất', 'Bạn muốn đăng xuất khỏi tài khoản?', [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted }] }>
      <SafeAreaView style={[styles.topArea, { backgroundColor: colors.surfaceMuted }] }>
        <View style={styles.topContent}>
          {}
          <View style={styles.logoSection}>
            <MaterialCommunityIcons name="dumbbell" size={26} color={colors.primary} style={{ marginRight: 8 }} />
            <View>
              <Text style={[styles.logoText, { color: colors.text }]}>FitZone Gym</Text>
              <Text style={[styles.subText, { color: colors.textMuted }]}>Hệ thống quản lý</Text>
            </View>
          </View>

          {}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {isMobileNav && (
              <Pressable
                style={[styles.menuIconOnly, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => setShowMenu(true)}
              >
                <Ionicons name="menu" size={24} color={colors.text} />
              </Pressable>
            )}

            {}
            {user && (
              <View style={{ position: 'relative', zIndex: 10000 }}>
                <Pressable
                  style={styles.cartIconOnly}
                  onPress={async () => {
                    const next = !showNotif;
                    setShowNotif(next);
                    if (next) {
                      await fetchNotifs();
                    }
                  }}
                >
                  <Ionicons name="notifications-outline" size={26} color={colors.text} />
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </Pressable>
              </View>
            )}

            {}
            {!isMobileNav && user && (
              <Pressable style={styles.cartIconOnly} onPress={() => router.push('/checkout' as any)}>
                <Ionicons name="cart-outline" size={26} color={colors.text} />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </Pressable>
            )}

            {}
            {user ? (
              <>
                {!isMobileNav && (
                  <Pressable style={[styles.userWidget, { maxWidth: userWidgetMaxWidth, backgroundColor: isDark ? '#1f2937' : '#e2e8f0', borderColor: colors.border }]} onPress={() => router.push('/profile' as any)}>
                    <View style={[styles.userIconBox, { backgroundColor: isDark ? '#374151' : '#cbd5e1' }]}>
                      <Ionicons name="person" size={16} color={colors.text} />
                    </View>
                    <View>
                      <Text style={[styles.widgetName, { color: colors.text }]} numberOfLines={1}>{user?.name || 'Thành viên'}</Text>
                      <Text style={[styles.widgetRole, { color: colors.textMuted }]}>
                        {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'trainer' ? 'Huấn luyện viên' : 'Hội viên'}
                      </Text>
                    </View>
                  </Pressable>
                )}
              </>
            ) : (
                <Pressable style={[styles.loginBtn, { backgroundColor: colors.primary }]} onPress={() => router.replace('/login')}>
                <Text style={styles.loginText}>Đăng nhập</Text>
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>

      {}
      {!isMobileNav && (
        <View style={[styles.navBar, { backgroundColor: isDark ? '#1f2937' : '#0f766e73' }] }>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
            {topMenuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Pressable
                  key={item.id}
                  style={[styles.navItem, active && styles.navItemActive, active && { backgroundColor: colors.surface }]}
                  onPress={() => router.push(item.path as any)}
                >
                  <MaterialCommunityIcons 
                    name={item.icon as any} 
                    size={20} 
                    color={active ? colors.primary : colors.text} 
                  />
                  <Text style={[styles.navText, { color: active ? colors.primaryDark : colors.textMuted }, active && styles.navTextActive]}>
                    {item.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {showMenu && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <View style={styles.drawerOverlayRoot}>
            <Pressable style={styles.drawerOverlay} onPress={() => setShowMenu(false)} />
            <View style={[styles.drawerPanel, { backgroundColor: colors.surface, borderRightColor: colors.border }]}>
              <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.drawerTitle, { color: colors.text }]}>Menu</Text>
                <Pressable onPress={() => setShowMenu(false)}>
                  <Ionicons name="close" size={22} color={colors.text} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.drawerList}>
                {drawerMenuItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.drawerItem,
                        { borderColor: colors.border, backgroundColor: active ? (isDark ? '#1e3a8a' : '#dbeafe') : colors.surfaceMuted },
                      ]}
                      onPress={() => {
                        setShowMenu(false);
                        router.push(item.path as any);
                      }}
                    >
                      <MaterialCommunityIcons name={item.icon as any} size={20} color={active ? colors.primary : colors.text} />
                      <View style={styles.drawerItemTitleRow}>
                        <Text style={[styles.drawerItemText, { color: active ? colors.primary : colors.text }]}>{item.title}</Text>
                        {item.id === 'checkout' && cartCount > 0 && (
                          <View style={[styles.drawerCountBadge, { backgroundColor: '#ef4444' }]}>
                            <Text style={styles.drawerCountBadgeText}>{cartCount}</Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}

                {user?.role === 'admin' && (
                  <View style={[styles.adminSection, { borderColor: colors.border }]}> 
                    <Pressable
                      style={[styles.drawerItem, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
                      onPress={() => setAdminMenuExpanded((v) => !v)}
                    >
                      <View style={styles.drawerItemLeft}>
                        <MaterialCommunityIcons name="shield-crown-outline" size={20} color={colors.text} />
                        <Text style={[styles.drawerItemText, { color: colors.text }]}>Quản trị hệ thống</Text>
                      </View>
                      <Ionicons name={adminMenuExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
                    </Pressable>

                    {adminMenuExpanded && (
                      <View style={[styles.adminSubMenu, { borderTopColor: colors.border }]}> 
                        {adminSubMenuItems.map((subItem) => (
                          <Pressable
                            key={subItem.id}
                            style={[styles.adminSubItem, { borderBottomColor: colors.border }]}
                            onPress={() => {
                              setShowMenu(false);
                              setAdminMenuExpanded(false);
                              subItem.action();
                            }}
                          >
                            <MaterialCommunityIcons name={subItem.icon as any} size={18} color={colors.textMuted} />
                            <Text style={[styles.adminSubItemText, { color: colors.text }]}>{subItem.title}</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {user && (
                  <Pressable
                    style={[styles.drawerLogoutBtn, { backgroundColor: '#ef4444' }]}
                    onPress={async () => {
                      setShowMenu(false);
                      await onLogoutPress();
                    }}
                  >
                    <MaterialCommunityIcons name="logout" size={18} color="#fff" />
                    <Text style={styles.drawerLogoutText}>Đăng xuất</Text>
                  </Pressable>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {}
      {showNotif && user && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setShowNotif(false)}
        >
          <View style={{ flex: 1 }}>
            <Pressable style={styles.overlay} onPress={() => setShowNotif(false)} />
            <View style={[styles.notifPanelContainer, { width: notifPanelWidth, maxHeight: notifPanelMaxHeight, right: width < 380 ? 8 : 16, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              {notifications.length > 0 && (
                <Pressable onPress={markAllRead} style={[styles.markAllBtn, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
                </Pressable>
              )}
              <ScrollView style={styles.notifPanel} contentContainerStyle={{ padding: 10 }}>
                {notifications.length === 0 ? (
                  <Text style={styles.notifEmpty}>Chưa có thông báo</Text>
                ) : (
                  notifications.map((n) => (
                    <View key={n.id} style={[styles.notifItem, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.notifTitle, { color: colors.text }]}>{n.title}</Text>
                      <Text style={[styles.notifMessage, { color: colors.textMuted }]}>{n.message}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: UI.colors.text,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    zIndex: 1000,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  topArea: { backgroundColor: UI.colors.text },
  topContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoSection: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 20, fontWeight: '800', color: '#fff', fontFamily: UI.font.heading },
  subText: { fontSize: 11, color: '#cbd5e1', fontFamily: UI.font.body },
  cartIconOnly: { position: 'relative', padding: 4 },
  menuIconOnly: {
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: UI.colors.accent, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: UI.colors.text },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  userWidget: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  userIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  widgetName: { color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: UI.font.body },
  widgetRole: { color: '#dbeafe', fontSize: 10, fontWeight: '500', fontFamily: UI.font.body },
  smallLogoutBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(239, 68, 68, 0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  loginBtn: { backgroundColor: '#fff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  loginText: { color: UI.colors.primary, fontWeight: '700', fontSize: 13, fontFamily: UI.font.heading },
  navBar: { backgroundColor: 'rgba(15, 118, 110, 0.45)' },
  navScroll: { paddingHorizontal: 10, paddingVertical: 8 },
  navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, marginHorizontal: 4, borderRadius: 999 },
  navItemActive: { backgroundColor: '#ffffff', marginBottom: 0 },
  navText: { color: '#dbeafe', fontSize: 14, fontWeight: '700', marginLeft: 6, fontFamily: UI.font.body },
  navTextActive: { color: UI.colors.primaryDark, fontWeight: '800' },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 99990,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
    zIndex: 99990,
  },
  notifPanelContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 99999,
    overflow: 'hidden',
  },
  notifPanel: { 
    flex: 1,
  },
  notifItem: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  notifTitle: { fontWeight: '700', color: UI.colors.text, marginBottom: 2, fontFamily: UI.font.body },
  notifMessage: { color: UI.colors.textMuted, fontSize: 13, fontFamily: UI.font.body },
  notifEmpty: { color: UI.colors.textMuted, fontSize: 13, textAlign: 'center', fontFamily: UI.font.body },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 10, alignItems: 'flex-end', backgroundColor: '#f8fafc' },
  markAllText: { color: UI.colors.primaryDark, fontWeight: '700', fontSize: 13, fontFamily: UI.font.body },
  drawerOverlayRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  drawerPanel: {
    width: 280,
    maxWidth: '80%',
    borderRightWidth: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 48,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: UI.font.heading,
  },
  drawerList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  drawerItemTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: UI.font.body,
  },
  drawerCountBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerCountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: UI.font.body,
  },
  adminSection: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  adminSubMenu: {
    borderTopWidth: 1,
  },
  adminSubItem: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  adminSubItemText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: UI.font.body,
  },
  drawerLogoutBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  drawerLogoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: UI.font.heading,
  },
});

