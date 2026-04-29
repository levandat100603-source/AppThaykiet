// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../api/context/AuthContext';
// TẠM THỜI bỏ import notifications để khỏi dùng trên web
// import { registerForPushNotificationsAsync } from '../../api/utils/notifications';

export default function LoginScreen({ navigation }: any) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    console.log('🔥 LOGINSCREEN ĐANG ĐƯỢC DÙNG 🔥');

    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      console.log('👉 Gọi API /login ...');
      await login(email, password); // gọi hook ở trên
      console.log('✅ Login thành công, điều hướng sang Schedules...');

      // ❌ TẮT push notification trên web, vì nó đang chặn luồng
      // Nếu sau này cần, ta sẽ xử lý riêng cho mobile:
      // registerForPushNotificationsAsync().catch(err =>
      //   console.log('Push notification error (bỏ qua trên web):', err),
      // );

      navigation.replace('Schedules'); // tên phải trùng trong AppNavigator
    } catch (e: any) {
      const res = e?.response?.data;
      console.log('❌ Lỗi đăng nhập (catch ở LoginScreen):', res || e.message);

      let message = 'Đăng nhập thất bại, vui lòng kiểm tra lại thông tin';
      if (res?.message) {
        message = res.message; // "Email hoặc mật khẩu không đúng"
      }

      Alert.alert('Đăng nhập thất bại', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity
        onPress={onLogin}
        disabled={loading}
        style={[
          styles.button,
          { backgroundColor: loading ? '#999' : '#2ecc71' },
        ]}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
        </Text>
      </TouchableOpacity>

      <Text
        onPress={() => navigation.navigate('Register')}
        style={styles.link}
      >
        Chưa có tài khoản? Đăng ký
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 16, textAlign: 'center', color: 'blue' },
});
