import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Switch
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/api/context/AuthContext';
import VerifyEmail from './verify-email'; 
import { UI } from '../src/ui/design';
import { api } from '../src/api/client';

export default function LoginPage() {
  const router = useRouter();
  const { login, getToken } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showVerifyScreen, setShowVerifyScreen] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check for saved token and auto-login
    const checkAutoLogin = async () => {
      try {
        setCheckingAuth(true);
        
        // Check if token exists
        const token = await getToken();
        if (token) {
          // Token found, verify it's still valid by checking user info
          try {
            await api.get('/user');
            // Token is valid, get user role
            const userRes = await api.get('/user');
            const role = userRes?.data?.role;
            
            // Auto-redirect based on role
            if (role === 'admin') {
              router.replace('/admin/dashboard' as Href);
            } else if (role === 'trainer') {
              router.replace('/bookings' as Href);
            } else {
              router.replace('/schedules' as Href);
            }
            return;
          } catch (tokenErr) {
            // Token is invalid or expired, clear it
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('gym_remember_credentials');
          }
        }
        
        // No valid token, load saved credentials if remember me was checked
        const saved = await AsyncStorage.getItem('gym_remember_credentials');
        if (saved) {
          const { email: savedEmail, remember } = JSON.parse(saved);
          setEmail(savedEmail);
          setRememberMe(remember);
        }
      } catch (err) {
        console.error('Error checking auto-login:', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAutoLogin();
  }, []);

  const onSubmit = async () => {
    setError('');
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.replace(/\s/g, '');
    
    if (!trimmedEmail || !trimmedPassword) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    if (password !== trimmedPassword) {
      setError('Mật khẩu không được chứa khoảng trắng');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Email không hợp lệ. Vui lòng nhập đúng định dạng (ví dụ: admin@example.com)');
      return;
    }

    setLoading(true);
    try {
      // Save credentials if remember me is checked
      if (rememberMe) {
        await AsyncStorage.setItem('gym_remember_credentials', JSON.stringify({
          email: trimmedEmail,
          remember: true,
        }));
      } else {
        await AsyncStorage.removeItem('gym_remember_credentials');
      }

      const res: any = await login(trimmedEmail, trimmedPassword);
      const role = res?.data?.user?.role;
      
      if (role === 'admin') {
        router.replace('/admin/dashboard' as Href);
      } else if (role === 'trainer') {
        router.replace('/bookings' as Href);
      } else {
        router.replace('/schedules' as Href);
      }

    } catch (e: any) {
      console.log('Login error:', e?.response?.data); 
      
      const errorMessage = e?.response?.data?.message;
      const statusCode = e?.response?.status;

      if (statusCode === 403 && e?.response?.data?.requires_verification) {
        const userEmail = e?.response?.data?.email;
        
        if (userEmail) {
          setUnverifiedEmail(userEmail);
          setShowVerifyScreen(true);
          return;
        }
      }

      let alertMsg = 'Đã có lỗi xảy ra';
      if (statusCode === 401) {
        alertMsg = errorMessage || 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại!';
      } else if (statusCode === 403) {
        alertMsg = errorMessage || 'Email chưa được xác thực. Vui lòng kiểm tra email.';
      } else if (statusCode === 422) {
        alertMsg = 'Vui lòng kiểm tra lại thông tin đăng nhập';
      } else if (e?.message === 'Network Error') {
        alertMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra server đã chạy chưa?';
      } else {
        alertMsg = errorMessage || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
      }

      setError(alertMsg);
      if (__DEV__) {
        console.log('Login warning:', { statusCode, errorMessage, alertMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={UI.colors.primary} />
      </View>
    );
  }

  if (showVerifyScreen && unverifiedEmail) {
    return <VerifyEmail email={unverifiedEmail} />;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={UI.colors.bg} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.content}>
        <View style={styles.bgOrbA} />
        <View style={styles.bgOrbB} />

        <View style={styles.header}>
            <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="dumbbell" size={36} color={UI.colors.primary} />
            </View>
            <Text style={styles.appName}>FitZone</Text>
            <Text style={styles.appDesc}>Năng lượng mới cho hành trình gym và yoga</Text>
        </View>

        <View style={styles.card}>
            <Text style={styles.cardTitle}>Đăng nhập tài khoản</Text>
            <Text style={styles.cardSubTitle}>Chào mừng bạn quay lại. Cùng bắt đầu buổi tập hôm nay.</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="account-outline" size={20} color={UI.colors.textMuted} style={{marginRight: 10}}/>
                    <TextInput 
                        style={[
                          styles.input, 
                          Platform.OS === 'web' && ({ outlineStyle: 'none' } as any) 
                      ]}
                      placeholder="admin@gmail.com"
                      placeholderTextColor="#94a3b8" 
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color={UI.colors.textMuted} style={{marginRight: 10}}/>
                    <TextInput 
                        style={[
                        styles.input, 
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any) 
                    ]}
                    placeholder="••••••"
                    placeholderTextColor="#94a3b8" 
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <MaterialCommunityIcons name={showPassword ? "eye-off" : "eye"} size={20} color={UI.colors.textMuted} />
                    </Pressable>
                </View>
            </View>

            <View style={styles.passwordOptions}>
              <View style={styles.rememberMeContainer}>
                <Switch 
                  value={rememberMe}
                  onValueChange={setRememberMe}
                  trackColor={{ false: '#ccc', true: UI.colors.primary }}
                  thumbColor="#fff"
                />
                <Text style={styles.rememberText}>Ghi nhớ mật khẩu</Text>
              </View>
              <Pressable onPress={() => router.push('/forgot-password')}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </Pressable>
            </View>

            <Pressable 
                style={styles.loginBtn} 
                onPress={onSubmit}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.loginText}>Tiếp tục</Text>}
            </Pressable>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Chưa có tài khoản? </Text>
                <Pressable onPress={() => router.push('/register')}>
                    <Text style={styles.linkText}>Đăng ký ngay</Text>
                </Pressable>
            </View>

        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.colors.bg },
  scrollContent: { flexGrow: 1 },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  bgOrbA: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#c9f1ea',
  },
  bgOrbB: {
    position: 'absolute',
    bottom: -90,
    right: -30,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#ffe4cc',
  },
  header: { alignItems: 'center', marginBottom: 28, maxWidth: 420 },
  iconCircle: {
    width: 72,
    height: 72,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...UI.shadow.card,
  },
  appName: { fontSize: 30, fontWeight: '800', color: UI.colors.text, fontFamily: UI.font.heading },
  appDesc: { color: UI.colors.textMuted, fontSize: 14, textAlign: 'center', fontFamily: UI.font.body },
  
  card: { 
      backgroundColor: UI.colors.surface, 
      borderRadius: UI.radius.xl, 
      padding: 24, 
      width: '100%',       
      maxWidth: 450,       
      borderWidth: 1,
      borderColor: UI.colors.border,
      ...UI.shadow.card,
  },
  cardTitle: { fontSize: 24, fontWeight: '800', marginBottom: 6, color: UI.colors.text, fontFamily: UI.font.heading },
  cardSubTitle: { fontSize: 13, color: UI.colors.textMuted, marginBottom: 20, fontFamily: UI.font.body },
  errorBox: {
    backgroundColor: '#fff1f2',
    padding: 12,
    borderRadius: UI.radius.md,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: UI.colors.danger,
  },
  errorText: { color: '#be123c', fontSize: 14, fontWeight: '600', fontFamily: UI.font.body },
  
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: UI.colors.textMuted, marginBottom: 8, fontFamily: UI.font.body },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI.colors.border,
    borderRadius: UI.radius.md,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: UI.colors.surfaceMuted,
  },
  input: { flex: 1, fontSize: 16, color: UI.colors.text, fontFamily: UI.font.body },
  
  passwordOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 14,
    color: UI.colors.textMuted,
    fontFamily: UI.font.body,
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 14,
    color: UI.colors.primary,
    fontWeight: '600',
    fontFamily: UI.font.body,
  },
  
  loginBtn: {
    backgroundColor: UI.colors.primary,
    height: 50,
    borderRadius: UI.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: UI.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 4,
  },
  loginText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: UI.colors.textMuted, fontSize: 14, fontFamily: UI.font.body },
  linkText: { color: UI.colors.primaryDark, fontWeight: '800', fontSize: 14, fontFamily: UI.font.heading },
});

