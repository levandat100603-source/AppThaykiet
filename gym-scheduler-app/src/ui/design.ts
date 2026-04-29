import { Platform } from 'react-native';

export const UI = {
  colors: {
    bg: '#f3f7f4',
    surface: '#ffffff',
    surfaceMuted: '#eef4f1',
    text: '#0f172a',
    textMuted: '#64748b',
    primary: '#0f766e',
    primaryDark: '#115e59',
    accent: '#f97316',
    danger: '#dc2626',
    border: '#dbe5df',
    success: '#16a34a',
    warning: '#f59e0b',
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 20,
    xl: 28,
  },
  shadow: {
    card: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 6,
    },
  },
  font: {
    heading: Platform.select({
      web: "'Poppins', 'Trebuchet MS', 'Segoe UI', sans-serif",
      default: 'sans-serif-condensed',
    }),
    body: Platform.select({
      web: "'Manrope', 'Segoe UI', sans-serif",
      default: 'sans-serif',
    }),
  },
};

export type AppColors = typeof UI.colors;

export const getThemeColors = (isDark: boolean): AppColors => {
  if (!isDark) return UI.colors;
  return {
    bg: '#0b1220',
    surface: '#111827',
    surfaceMuted: '#1f2937',
    text: '#e5e7eb',
    textMuted: '#9ca3af',
    primary: '#22c55e',
    primaryDark: '#16a34a',
    accent: '#f59e0b',
    danger: '#f87171',
    border: '#374151',
    success: '#34d399',
    warning: '#fbbf24',
  };
};
