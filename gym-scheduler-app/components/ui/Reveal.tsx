import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useThemeMode } from '../../src/ui/theme-mode';

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  offsetY?: number;
  style?: ViewStyle;
};

export default function Reveal({
  children,
  delay = 0,
  duration = 420,
  offsetY = 18,
  style,
}: RevealProps) {
  const { motionMode } = useThemeMode();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offsetY)).current;

  const isAnimationOff = motionMode === 'off';
  const effectiveDuration = motionMode === 'reduced' ? Math.max(120, Math.round(duration * 0.55)) : duration;
  const effectiveDelay = motionMode === 'reduced' ? Math.round(delay * 0.4) : delay;

  useEffect(() => {
    if (isAnimationOff) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: effectiveDuration,
        delay: effectiveDelay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: effectiveDuration,
        delay: effectiveDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [effectiveDelay, effectiveDuration, isAnimationOff, opacity, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
