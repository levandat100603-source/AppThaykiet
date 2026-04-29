import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../src/api/client';
import VerifyEmail from './verify-email'; 
import { UI } from '../src/ui/design';

export default function RegisterPage() {
  const router = useRouter();
  
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showVerifyScreen, setShowVerifyScreen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  
  const onRegister = async () => {
    setError('');
    
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.replace(/\s/g, '');
    const trimmedConfirmPassword = confirmPassword.replace(/\s/g, '');
    
    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password !== trimmedPassword || confirmPassword !== trimmedConfirmPassword) {
      setError('Mật khẩu không được chứa khoảng trắng');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    if (trimmedPassword.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }

    setLoading(true);

    try {
      
      console.log('Đang đăng ký:', { name, email });
      
      const response = await api.post('/register', {
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (response.data.pending_id) {
        setPendingEmail(trimmedEmail);
        setShowVerifyScreen(true);
      }

    } catch (e: any) {
      console.log('Lỗi đăng ký:', e);
      
      let message = 'Có lỗi xảy ra, vui lòng thử lại';
      
      if (e.response && e.response.status === 422) {
         const errors = e.response.data.errors;
         if (errors) {
            const firstKey = Object.keys(errors)[0];
            message = errors[firstKey][0]; 
         } else {
             message = e.response.data.message;
         }
      } else if (e.response?.data?.message) {
         message = e.response.data.message;
      }

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showVerifyScreen && pendingEmail ? (
        <VerifyEmail email={pendingEmail} />
      ) : (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
            style={styles.container}
        >
        <StatusBar barStyle="dark-content" backgroundColor={UI.colors.bg} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.bgOrbA} />
        <View style={styles.bgOrbB} />

        <View style={styles.header}>
            <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="account-plus" size={36} color={UI.colors.primary} />
            </View>
          <Text style={styles.title}>Tạo tài khoản mới</Text>
          <Text style={styles.subtitle}>Đăng ký nhanh để đặt lớp, thuê HLV và theo dõi tiến độ tập luyện</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            </View>
        ) : null}

        <View style={styles.form}>
            
            {}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Họ và tên</Text>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={UI.colors.textMuted} style={styles.inputIcon} />
                    <TextInput 
                        style={[
                        styles.input, 
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                    ]}
                    placeholder="Nguyễn Văn A"
                    placeholderTextColor="#94a3b8" 
                    value={name}
                    onChangeText={setName}
                    />
                </View>
            </View>

            {}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="email-outline" size={20} color={UI.colors.textMuted} style={styles.inputIcon} />
                    <TextInput 
                        style={[
                            styles.input, 
                            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                        ]}
                        placeholder="example@gmail.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        placeholderTextColor="#94a3b8" 
                    />
                </View>
            </View>

            {}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Mật khẩu</Text>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color={UI.colors.textMuted} style={styles.inputIcon} />
                    <TextInput 
                        style={[
                            styles.input, 
                            Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                        ]}
                        placeholder="••••••"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        placeholderTextColor="#94a3b8" 
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                        <MaterialCommunityIcons 
                            name={showPassword ? "eye-off" : "eye"} 
                            size={20} 
                            color={UI.colors.textMuted} 
                        />
                    </Pressable>
                </View>
            </View>

            {}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Xác nhận mật khẩu</Text>
                <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-check-outline" size={20} color={UI.colors.textMuted} style={styles.inputIcon} />
                    <TextInput 
                        style={[
                        styles.input, 
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                    ]}
                    placeholder="••••••"
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholderTextColor="#94a3b8" 
                />
                </View>
            </View>

            {}
            <Pressable 
                style={({ pressed }) => [
                    styles.button, 
                    pressed && { opacity: 0.9 },
                    loading && { opacity: 0.7 }
                ]}
                onPress={onRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Đăng ký ngay</Text>
                )}
            </Pressable>

            {}
            <View style={styles.footer}>
                <Text style={styles.footerText}>Bạn đã có tài khoản? </Text>
                <Pressable onPress={() => router.replace('/login')}>
                    <Text style={styles.linkText}>Đăng nhập</Text>
                </Pressable>
            </View>

        </View>
      </ScrollView>
        </KeyboardAvoidingView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.colors.bg },
  scrollContent: { 
    flexGrow: 1, 
    padding: 24, 
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgOrbA: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#dff7ec',
  },
  bgOrbB: {
    position: 'absolute',
    bottom: -100,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#ffe4cf',
  },
  
  header: { alignItems: 'center', marginBottom: 24, maxWidth: 460 },
  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...UI.shadow.card,
  },
  title: { fontSize: 30, fontWeight: '800', color: UI.colors.text, marginBottom: 8, fontFamily: UI.font.heading },
  subtitle: { fontSize: 14, color: UI.colors.textMuted, textAlign: 'center', fontFamily: UI.font.body },
  errorBox: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#fff1f2',
    borderLeftWidth: 4,
    borderLeftColor: UI.colors.danger,
    padding: 12,
    marginVertical: 14,
    borderRadius: UI.radius.sm,
  },
  errorText: { color: '#9f1239', fontSize: 14, fontWeight: '600', fontFamily: UI.font.body },

  form: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: UI.colors.surface,
    borderRadius: UI.radius.xl,
    borderWidth: 1,
    borderColor: UI.colors.border,
    padding: 22,
    ...UI.shadow.card,
  },
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
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: UI.colors.text, fontFamily: UI.font.body },

  button: {
    backgroundColor: UI.colors.primary,
    height: 50,
    borderRadius: UI.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: UI.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: UI.colors.textMuted, fontSize: 14, fontFamily: UI.font.body },
  linkText: { color: UI.colors.primaryDark, fontWeight: '800', fontSize: 14, fontFamily: UI.font.heading },
});

