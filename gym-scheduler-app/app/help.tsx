import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';

export default function HelpScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tro giup va ho tro</Text>
      <Text style={styles.paragraph}>Neu ban gap van de khi dat lich, thanh toan, hoac cap nhat ho so, vui long lien he bo phan ho tro cua FitZone.</Text>
      <Text style={styles.section}>Kenh ho tro</Text>
      <Text style={styles.item}>- Hotline: 1900 0000</Text>
      <Text style={styles.item}>- Email: support@fitzone.local</Text>
      <Text style={styles.item}>- Gio ho tro: 08:00 - 21:00 (Thu 2 - Chu nhat)</Text>
      <Text style={styles.section}>Huong dan nhanh</Text>
      <Text style={styles.item}>- Dat lop tai man hinh Lich tap.</Text>
      <Text style={styles.item}>- Dat HLV tai man hinh HLV.</Text>
      <Text style={styles.item}>- Xem lich da dat tai Lich dat.</Text>
      <Text style={styles.item}>- Quan ly tai khoan tai Ho so.</Text>
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
