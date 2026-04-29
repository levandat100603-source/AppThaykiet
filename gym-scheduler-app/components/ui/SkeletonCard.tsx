import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type SkeletonCardProps = {
  style?: StyleProp<ViewStyle>;
  variant?: 'membership' | 'schedule' | 'trainer';
};

export default function SkeletonCard({ style, variant = 'schedule' }: SkeletonCardProps) {
  const shimmerX = useRef(new Animated.Value(-140)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 420,
        duration: 1100,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerX]);

  return (
    <View style={[styles.card, variant === 'trainer' && styles.cardTrainer, variant === 'membership' && styles.cardMembership, style]}>
      {variant === 'trainer' && <View style={styles.avatar} />}
      <View style={styles.lineLarge} />
      <View style={[styles.lineMedium, variant === 'membership' && styles.lineMediumMembership]} />
      <View style={[styles.lineSmall, variant === 'trainer' && styles.lineSmallTrainer]} />
      <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 150,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
    padding: 14,
    marginBottom: 14,
  },
  cardMembership: {
    height: 176,
  },
  cardTrainer: {
    height: 132,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#d1d5db',
    marginBottom: 10,
  },
  lineLarge: {
    width: '68%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#d1d5db',
    marginBottom: 12,
  },
  lineMedium: {
    width: '90%',
    height: 12,
    borderRadius: 8,
    backgroundColor: '#d1d5db',
    marginBottom: 8,
  },
  lineMediumMembership: {
    width: '72%',
  },
  lineSmall: {
    width: '56%',
    height: 12,
    borderRadius: 8,
    backgroundColor: '#d1d5db',
  },
  lineSmallTrainer: {
    width: '40%',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
});