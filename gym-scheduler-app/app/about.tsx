import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ve FitZone Gym</Text>
      <Text style={styles.paragraph}>FitZone la he thong quan ly phong gym va yoga, ho tro dat lop, dat HLV, theo doi lich tap va quan ly thanh vien theo vai tro Member, Trainer, Admin.</Text>
      <Text style={styles.section}>Tam nhin</Text>
      <Text style={styles.paragraph}>Xay dung trai nghiem tap luyen lien mach, minh bach va ca nhan hoa cho tung hoi vien.</Text>
      <Text style={styles.section}>Nen tang ho tro</Text>
      <Text style={styles.item}>- Mobile app: React Native (Expo)</Text>
      <Text style={styles.item}>- Backend API: Laravel + Sanctum</Text>
      <Text style={styles.item}>- Quan ly thanh toan, thong bao, booking va bao cao</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  section: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
  item: {
    fontSize: 15,
    lineHeight: 22,
  },
});
