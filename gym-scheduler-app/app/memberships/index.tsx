import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  useWindowDimensions,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../src/api/client';
import { useCart } from '../../src/api/context/CartContext';
import { useAuth } from '../../src/api/context/AuthContext';
import { UI, getThemeColors } from '../../src/ui/design';
import InteractivePressable from '../../components/ui/InteractivePressable';
import Reveal from '../../components/ui/Reveal';
import { notifySuccess } from '../../src/ui/feedback';
import SkeletonCard from '../../components/ui/SkeletonCard';
import { useThemeMode } from '../../src/ui/theme-mode';



const STYLE_CONFIG: any = {
  'default': { 
    features: ['Tập luyện tại phòng gym', 'Tủ đồ miễn phí'], 
    color: '#64748b', bgColor: '#f8fafc', buttonColor: 'blue' 
  },
  'Gói Cơ Bản': {
    features: ['Tập luyện tại phòng gym', 'Sử dụng thiết bị cơ bản', 'Tủ khóa cá nhân'],
    color: '#2563eb', 
    bgColor: '#eff6ff',
    buttonColor: 'blue',
  },
  'Gói Tiêu Chuẩn': {
    features: ['Tất cả quyền lợi Gói Cơ Bản', 'Tham gia lớp Yoga', 'Đo InBody miễn phí'],
    color: '#16a34a', 
    bgColor: '#f0fdf4',
    buttonColor: 'green',
  },
  'Gói Premium': {
    features: ['Tất cả quyền lợi Gói Tiêu Chuẩn', 'Tập cùng HLV 2 buổi/tháng', 'Xông hơi không giới hạn'],
    color: '#9333ea', 
    bgColor: '#faf5ff',
    buttonColor: 'blue',
  },
  'Gói VIP': {
    features: ['Full quyền lợi Premium', 'HLV cá nhân 1-1', 'Khu vực VIP riêng', 'Khách mời miễn phí'],
    color: '#d97706', 
    bgColor: '#fffbeb',
    buttonColor: 'green',
  }
};

export default function MembershipPage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { token, isInitializing } = useAuth();
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);
  const { width } = useWindowDimensions();
  const isCompact = width < 360;
  const cardWidth = Math.min(width - (isCompact ? 8 : 16), 600);
  
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailsModal, setDetailsModal] = useState<any>(null);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val).replace('₫', 'đ');

  const fetchPackages = useCallback(async () => {
    if (isInitializing) return;
    if (!token) {
      setPackages([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/packages'); 
      
      
      const mappedData = res.data.map((item: any) => {
        
        const style = STYLE_CONFIG[item.name] || STYLE_CONFIG['default'];
        
        
        const parsedBenefits = typeof item.benefits_text === 'string'
          ? item.benefits_text
              .split(/\r?\n|,/) 
              .map((feature: string) => feature.trim())
              .filter((feature: string) => feature.length > 0)
          : [];

        const featureList = parsedBenefits.length > 0 ? parsedBenefits : style.features;

        return {
          ...item,
          features: featureList,
          uiConfig: {
            color: item.color === 'amber' ? '#d97706' : (item.color === 'green' ? '#16a34a' : (item.color === 'purple' ? '#9333ea' : '#2563eb')),
            bgColor: style.bgColor,
            buttonColor: style.buttonColor
          }
        };
      });
      
      setPackages(mappedData);
    } catch (error) {
      console.log('Lỗi tải gói tập:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isInitializing, token]);

  useFocusEffect(
    useCallback(() => {
      fetchPackages();
    }, [fetchPackages])
  );

  useEffect(() => {
    if (!isInitializing && token) {
      fetchPackages();
    }
  }, [isInitializing, token, fetchPackages]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPackages();
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      type: 'membership',
      schedule: item.duration + ' tháng'
    });
    notifySuccess();
    Alert.alert("Thành công", `Đã thêm "${item.name}" vào giỏ hàng!`);
  };

  const renderPackageCard = (item: any, index: number) => {
    const { uiConfig } = item;
    const isPopular = item.is_popular === 1 || item.is_popular === true;
    
    // Show first 2 features by default, rest in details modal
    const displayFeatures = (item.features || [])
      .map((feature: string) => (feature || '').trim())
      .filter((feature: string) => feature.length > 0)
      .slice(0, 2);
    
    const allFeatures = (item.features || [])
      .map((feature: string) => (feature || '').trim())
      .filter((feature: string) => feature.length > 0);

    return (
      <Reveal key={item.id} delay={index * 60}>
        <View
          style={[
            styles.card,
            { width: cardWidth, minWidth: cardWidth, maxWidth: cardWidth },
            isCompact && styles.cardCompact,
            isPopular 
              ? { borderColor: uiConfig.color, borderWidth: 2.5, zIndex: 10 } 
              : { borderColor: colors.border, borderWidth: 1 },
            { backgroundColor: colors.surface } 
          ]}
        >
          {isPopular && (
            <View style={[styles.popularBadge, { backgroundColor: uiConfig.color }]}>
              <MaterialCommunityIcons name="crown" size={14} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.popularText}>Phổ biến nhất</Text>
            </View>
          )}

          {/* Scrollable content area */}
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={[styles.packageName, { color: uiConfig.color }]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.durationBadge, { backgroundColor: uiConfig.color + '15' }]}> 
                <Text style={[styles.durationBadgeText, { color: uiConfig.color }]}>
                  ⏱ {item.duration} tháng
                </Text>
              </View>
            </View>

            {/* Price Section - More prominent */}
            <View style={[styles.priceSection, { backgroundColor: uiConfig.color + '10', borderColor: uiConfig.color + '30' }]}> 
              <Text style={[styles.priceLabel, { color: uiConfig.color }]}>Giá</Text>
              <Text style={[styles.price, { color: uiConfig.color }]}>
                {formatCurrency(item.price)}
              </Text>
              {item.old_price > item.price && (
                <Text style={[styles.oldPrice, { color: colors.textMuted }]}>
                  Giá gốc: {formatCurrency(item.old_price)}
                </Text>
              )}
            </View>

            {/* Features Preview */}
            <View style={styles.featuresSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Ưu đãi chính</Text>
              <View style={styles.featuresList}>
                {[0, 1].map((idx: number) => {
                  const feature = displayFeatures[idx];
                  return (
                    <View key={idx} style={[styles.featureItem, { backgroundColor: colors.surfaceMuted }]}> 
                      <View style={[styles.featureIconBox, { backgroundColor: uiConfig.color + '20' }]}>
                        {feature ? <Ionicons name="checkmark" size={14} color={uiConfig.color} /> : null}
                      </View>
                      <Text style={[styles.featureText, { color: colors.text }]} numberOfLines={2}>
                        {feature || ''}
                      </Text>
                    </View>
                  );
                })}
              </View>
              
              {allFeatures.length > 2 ? (
                <InteractivePressable
                  style={[styles.detailsBtn, { borderColor: uiConfig.color + '40' }]}
                  pressedStyle={{ opacity: 0.6 }}
                  onPress={() => setDetailsModal(item)}
                >
                  <Text style={[styles.detailsBtnText, { color: uiConfig.color }]}>
                    Xem chi tiết (còn {allFeatures.length - 2} ưu đãi)
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={uiConfig.color} />
                </InteractivePressable>
              ) : (
                <View style={styles.detailsBtnPlaceholder} />
              )}
            </View>
          </View>

          {/* Action Button */}
          <InteractivePressable
            style={[
              styles.button,
              { backgroundColor: uiConfig.color },
            ]}
            pressedStyle={{ opacity: 0.9 }}
            haptic="light"
            onPress={() => handleAddToCart(item)}
          >
            <MaterialCommunityIcons name="cart-plus" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Đăng ký ngay</Text>
          </InteractivePressable>
        </View>
      </Reveal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isCompact && styles.scrollContentCompact]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.headerTitleBox, isCompact && styles.headerTitleBoxCompact]}>
          <Text style={[styles.pageTitle, isCompact && styles.pageTitleCompact, { color: colors.text }]}>Gói thành viên</Text>
          <Text style={[styles.pageSubtitle, isCompact && styles.pageSubtitleCompact, { color: colors.textMuted }]}>Chọn gói phù hợp với mục tiêu tập luyện của bạn</Text>
        </View>
        {loading ? (
          <View style={styles.listContainer}>
            {[0, 1, 2].map((item) => (
              <SkeletonCard key={item} variant="membership" style={{ width: cardWidth }} />
            ))}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {packages.length > 0 ? (
              packages.map((pkg, index) => renderPackageCard(pkg, index))
            ) : (
              <View style={styles.emptyBox}>
                <MaterialCommunityIcons name="account-off-outline" size={60} color="#cbd5e1" style={{marginBottom: 10}} />
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>Chưa có gói tập nào được kích hoạt.</Text>
                <InteractivePressable
                  style={styles.emptyCta}
                  haptic="light"
                  onPress={() => router.push('/schedules')}>
                  <Text style={styles.emptyCtaText}>Xem lịch lớp đang mở</Text>
                </InteractivePressable>
              </View>
            )}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Details Modal */}
      <Modal 
        visible={detailsModal !== null} 
        transparent 
        animationType="fade"
        onRequestClose={() => setDetailsModal(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.55)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            {detailsModal && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalSectionTitle, { color: colors.text, marginBottom: 0 }]}>Tất cả ưu đãi</Text>
                  <Pressable 
                    style={[styles.closeBtn, { backgroundColor: colors.surfaceMuted, borderRadius: 10 }]}
                    onPress={() => setDetailsModal(null)}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </Pressable>
                </View>

                <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.allFeaturesList}>
                    {(detailsModal.features || [])
                      .map((feature: string) => (feature || '').trim())
                      .filter((feature: string) => feature.length > 0)
                      .map((feature: string, idx: number) => (
                        <View key={idx} style={[styles.allFeatureItem, { backgroundColor: detailsModal.uiConfig.color + '12' }]}>
                          <View style={[{ width: 28, height: 28, borderRadius: 8, backgroundColor: detailsModal.uiConfig.color + '25', justifyContent: 'center', alignItems: 'center', marginTop: 2, flexShrink: 0 }]}>
                            <Ionicons name="checkmark" size={16} color={detailsModal.uiConfig.color} />
                          </View>
                          <Text style={[styles.allFeatureText, { color: colors.text }]}>
                            {feature}
                          </Text>
                        </View>
                      ))
                    }
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.colors.bg },
  scrollContent: { paddingHorizontal: 8, paddingTop: 16, paddingBottom: 60, alignItems: 'center' },
  scrollContentCompact: { paddingHorizontal: 4, paddingTop: 14 },
  headerTitleBox: { alignItems: 'center', marginBottom: 26, marginTop: 12, paddingHorizontal: 8 },
  headerTitleBoxCompact: { marginBottom: 18, marginTop: 6 },
  pageTitle: { fontSize: 32, fontWeight: '900', color: UI.colors.text, marginBottom: 8, fontFamily: UI.font.heading },
  pageTitleCompact: { fontSize: 26 },
  pageSubtitle: { fontSize: 15, color: UI.colors.textMuted, textAlign: 'center', fontFamily: UI.font.body, lineHeight: 22 },
  pageSubtitleCompact: { fontSize: 13 },
  
  listContainer: { width: '100%', maxWidth: 600, marginBottom: 30, alignItems: 'center', alignSelf: 'center' },
  
  // Card Styles
  card: {
    backgroundColor: UI.colors.surface,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: UI.colors.border,
    ...UI.shadow.card,
    width: '100%',
    marginBottom: 16,
    marginHorizontal: 0,
    alignSelf: 'stretch',
    height: 610,
    display: 'flex',
    flexDirection: 'column',
  },
  cardCompact: { padding: 18, marginBottom: 14, height: 560 },
  
  cardContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  
  cardHeader: { marginBottom: 18, minHeight: 64 },
  popularBadge: { position: 'absolute', top: -1, right: 14, flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  popularText: { color: '#fff', fontSize: 12, fontWeight: '700', fontFamily: UI.font.heading },
  
  packageName: { fontSize: 32, fontWeight: '900', marginBottom: 10, fontFamily: UI.font.heading },
  durationBadge: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start' },
  durationBadgeText: { fontSize: 13, fontWeight: '700', fontFamily: UI.font.body },
  
  // Price Section
  priceSection: { 
    borderWidth: 1, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 18,
    minHeight: 108,
    justifyContent: 'center',
  },
  priceLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: UI.font.heading },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 40, fontWeight: '900', fontFamily: UI.font.heading },
  oldPrice: { fontSize: 13, marginTop: 8, textDecorationLine: 'line-through', fontFamily: UI.font.body },
  
  // Features Section
  featuresSection: { marginBottom: 0, minHeight: 190 },
  sectionTitle: { fontSize: 12, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: UI.font.heading },
  featuresList: { gap: 10, marginBottom: 14 },
  featureItem: { 
    flexDirection: 'row', 
    gap: 12, 
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    height: 58,
  },
  featureIconBox: { width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  featureText: { fontSize: 14, flex: 1, lineHeight: 19, fontFamily: UI.font.body, fontWeight: '500' },
  
  // Details Button
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    minHeight: 48,
  },
  detailsBtnText: { fontSize: 12, fontWeight: '700', fontFamily: UI.font.heading },
  detailsBtnPlaceholder: { minHeight: 48 },
  
  // Action Button
  button: { 
    paddingVertical: 16, 
    borderRadius: 13, 
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...UI.shadow.card,
    marginTop: 'auto',
  },
  buttonText: { color: '#fff', fontWeight: '900', fontSize: 16, fontFamily: UI.font.heading },
  
  // Empty State
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, width: '100%' },
  emptyText: { color: UI.colors.textMuted, fontSize: 16, marginTop: 8, fontFamily: UI.font.body, textAlign: 'center' },
  emptyCta: { marginTop: 16, backgroundColor: UI.colors.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 13 },
  emptyCtaText: { color: '#fff', fontWeight: '800', fontFamily: UI.font.heading },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 12,
    paddingBottom: 10,
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    minHeight: 360,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  closeBtn: { padding: 10 },
  modalDivider: { height: 1, marginVertical: 18 },
  modalScroll: { flexGrow: 0 },
  modalScrollContent: { paddingBottom: 12 },
  modalSectionTitle: { fontSize: 12, fontWeight: '800', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.4, fontFamily: UI.font.heading },
  allFeaturesList: { gap: 12, marginBottom: 12 },
  allFeatureItem: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
  },
  allFeatureText: { fontSize: 15, flex: 1, lineHeight: 23, fontFamily: UI.font.body, fontWeight: '500', marginTop: 2 },
});

