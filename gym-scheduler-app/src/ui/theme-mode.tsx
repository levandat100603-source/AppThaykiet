import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';
type MotionMode = 'normal' | 'reduced' | 'off';

type ThemeModeContextValue = {
  mode: ThemeMode;
  motionMode: MotionMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  setMotionMode: (mode: MotionMode) => Promise<void>;
};

const THEME_MODE_KEY = 'app_theme_mode';
const MOTION_MODE_KEY = 'app_motion_mode';

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [motionMode, setMotionModeState] = useState<MotionMode>('normal');

  useEffect(() => {
    (async () => {
      const storedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (storedMode !== 'light') {
        await AsyncStorage.setItem(THEME_MODE_KEY, 'light');
      }
      setModeState('light');

      const storedMotion = await AsyncStorage.getItem(MOTION_MODE_KEY);
      if (storedMotion === 'normal' || storedMotion === 'reduced' || storedMotion === 'off') {
        setMotionModeState(storedMotion);
      }
    })();
  }, []);

  const setMode = async (nextMode: ThemeMode) => {
    setModeState('light');
    await AsyncStorage.setItem(THEME_MODE_KEY, 'light');
  };

  const setMotionMode = async (nextMode: MotionMode) => {
    setMotionModeState(nextMode);
    await AsyncStorage.setItem(MOTION_MODE_KEY, nextMode);
  };

  const isDark = false;

  const value = useMemo(
    () => ({ mode, motionMode, isDark, setMode, setMotionMode }),
    [mode, motionMode, isDark]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
}