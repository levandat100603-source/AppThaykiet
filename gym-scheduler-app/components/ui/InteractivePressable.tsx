import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

type HapticType = 'none' | 'selection' | 'light';

type InteractivePressableProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: HapticType;
};

export default function InteractivePressable({
  children,
  style,
  pressedStyle,
  scaleTo = 0.98,
  haptic = 'selection',
  onPressIn,
  onPressOut,
  ...rest
}: InteractivePressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 180,
    }).start();
  };

  const triggerHaptic = () => {
    if (Platform.OS === 'web' || haptic === 'none') return;
    if (haptic === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }
    Haptics.selectionAsync();
  };

  return (
    <Pressable
      {...rest}
      onPressIn={(event) => {
        animateTo(scaleTo);
        triggerHaptic();
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}>
      {({ pressed }) => (
        <Animated.View
          style={[
            style,
            pressed && pressedStyle,
            { transform: [{ scale }] },
          ]}>
          {children}
        </Animated.View>
      )}
    </Pressable>
  );
}