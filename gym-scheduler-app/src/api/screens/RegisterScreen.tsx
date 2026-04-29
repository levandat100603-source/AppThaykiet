import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  Pressable, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Import Icon
import { useAuth } from '../../api/context/AuthContext';
import { registerForPushNotificationsAsync } from '../../api/utils/notifications';

export default function RegisterScreen({ navigation }: any) {
  const { register, loading } = useAuth();
  
  // State quản lý dữ liệu nhập
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // State hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onRegister = async () => {
    // 1. Validate cơ bản
    if (!name.trim() || !email.trim() || !password || !passwordConfirm) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    
    // Validate Email đơn giản
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
       Alert.alert('Lỗi', 'Email không đúng định dạng');
       return;
    }

    if (password.length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }

    if (password !== passwordConfirm) {
      Alert.alert('Lỗi', 'Mật khẩu nhập lại không khớp');
      return;
    }

    try {
      // 2. Gọi API Đăng ký từ AuthContext
      await register(name, email, password);

      // 3. Đăng ký Push Notification (Không chặn luồng nếu lỗi)
      try {
        await registerForPushNotificationsAsync();
      } catch (err) {
        console.log('⚠️ Lỗi đăng ký push notification (có thể bỏ qua):', err);
      }

      // 4. Thành công -> Chuyển hướng
      Alert.alert('Thành công', 'Chào mừng bạn đến với FitZone Gym!');
      // Dùng reset để xóa lịch sử navigation, người dùng không back lại trang đăng ký được
      navigation.reset({
        index: 0,
        routes: [{ name: 'Schedules' }],
      });

    } catch (e: any) {
      const res = e?.response?.data;
      console.log('❌ Lỗi đăng ký:', res || e.message);

      let message = 'Đăng ký thất bại, vui lòng thử lại.';
      
      // Xử lý thông báo lỗi từ Laravel trả về (thường là dạng mảng)
      if (res?.errors) {
          if (res.errors.email) message = res.errors.email[0];
          else if (res.errors.password) message = res.errors.password[0];
      } else if (res?.message) {
          message = res.message;
      }

      Alert.alert('Đăng ký thất bại', message);
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
    >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                {/* Logo hoặc Tiêu đề */}
                <View style={styles.header}>
                    <Ionicons name="barbell" size={60} color="#2563eb" />
                    <Text style={styles.appName}>FitZone Gym</Text>
                    <Text style={styles.title}>Đăng ký thành viên mới</Text>
                </View>

                {/* Form nhập liệu */}
                <View style={styles.form}>
                    {/* Họ tên */}
                    <View style={styles.inputGroup}>
                        <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Họ và tên"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Mật khẩu */}
                    <View style={styles.inputGroup}>
                        <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Nhập lại mật khẩu */}
                    <View style={styles.inputGroup}>
                        <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu"
                            value={passwordConfirm}
                            onChangeText={setPasswordConfirm}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                            <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
                        </Pressable>
                    </View>

                    {/* Nút Đăng ký */}
                    <Pressable 
                        style={[styles.btnRegister, loading && styles.btnDisabled]} 
                        onPress={onRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.btnText}>ĐĂNG KÝ NGAY</Text>
                        )}
                    </Pressable>
                </View>

                {/* Chuyển sang Đăng nhập */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Bạn đã có tài khoản?</Text>
                    <Pressable onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkLogin}>Đăng nhập</Text>
                    </Pressable>
                </View>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24,
    backgroundColor: '#fff' 
  },
  header: {
      alignItems: 'center',
      marginBottom: 32,
  },
  appName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2563eb',
      marginTop: 8,
  },
  title: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  form: {
      marginBottom: 24,
  },
  inputGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
      marginBottom: 16,
      backgroundColor: '#f8fafc',
      paddingHorizontal: 12,
      height: 50,
  },
  inputIcon: {
      marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1e293b',
  },
  eyeIcon: {
      padding: 8,
  },
  btnRegister: {
      backgroundColor: '#2563eb', // Màu xanh Gym
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
      shadowColor: '#2563eb',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
  },
  btnDisabled: {
      backgroundColor: '#94a3b8',
      shadowOpacity: 0,
      elevation: 0,
  },
  btnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
  },
  footerText: {
      color: '#64748b',
  },
  linkLogin: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },
});