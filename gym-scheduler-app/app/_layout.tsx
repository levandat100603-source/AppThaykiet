import { Stack, usePathname } from 'expo-router';
// 1. Thêm Platform vào dòng này 👇
import { View, StyleSheet, StatusBar, Platform } from 'react-native'; 
import CustomHeader from '../components/CustomHeader';
import { CartProvider } from '../src/api/context/CartContext';
import { AuthProvider } from '@/src/api/context/AuthContext';
import { UI } from '@/src/ui/design';
import { ThemeModeProvider, useThemeMode } from '@/src/ui/theme-mode';

function RootShell() {
  const { isDark, motionMode } = useThemeMode();
  const pathname = usePathname();
  const showHeader = pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password';

  const stackAnimation =
    motionMode === 'off'
      ? 'none'
      : motionMode === 'reduced'
        ? 'fade'
        : Platform.OS === 'android'
          ? 'fade_from_bottom'
          : 'slide_from_right';

  return (
    <AuthProvider>
      <CartProvider>
        <View style={[styles.container, { backgroundColor: isDark ? '#0b1220' : UI.colors.bg }]}>
          <StatusBar 
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={isDark ? '#0b1220' : UI.colors.bg}
          />
          
          {/* 👇 2. THÊM ĐOẠN NÀY ĐỂ XÓA CON MẮT THỪA TRÊN WEB 👇 */}
          {Platform.OS === 'web' && (
            <style type="text/css">{`
              input::-ms-reveal,
              input::-ms-clear {
                display: none;
              }
            `}</style>
          )}
          {/* 👆 KẾT THÚC ĐOẠN THÊM MỚI 👆 */}

          {showHeader && <CustomHeader />}
          
          <View style={styles.content}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: stackAnimation,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            />
          </View>
        </View>
      </CartProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeModeProvider>
      <RootShell />
    </ThemeModeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.colors.bg, 
  },
  content: {
    flex: 1,
  },
});