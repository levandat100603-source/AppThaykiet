import React, { useState } from 'react';
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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UI } from '../src/ui/design';
import { api } from '../src/api/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'send-code' | 'reset-password'>('send-code');

  const onSendCode = async () => {
    setError('');
    
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setError('Vui lòng nhập email của bạn');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/forgot-password', {
        email: trimmedEmail,
      });

      Alert.alert(
        'Đã gửi mã thành công',
        'Mã đặt lại mật khẩu gồm 8 ký tự đã được gửi đến email của bạn.',
        [
          {
            text: 'Tiếp tục',
            onPress: () => setStep('reset-password'),
          },
        ]
      );
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || 'Không thể gửi mã lúc này. Vui lòng thử lại sau.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async () => {
    setError('');

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim().toUpperCase().replace(/\s/g, '');
    const trimmedPassword = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedEmail || !trimmedCode || !trimmedPassword || !trimmedConfirm) {
      setError('Vui lòng nhập đầy đủ thông tin để đặt lại mật khẩu.');
      return;
    }

    if (trimmedCode.length !== 8) {
      setError('Mã đặt lại phải gồm đúng 8 ký tự.');
      return;
    }

    if (trimmedPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (!/[A-Za-z]/.test(trimmedPassword) || !/[0-9]/.test(trimmedPassword)) {
      setError('Mật khẩu mới phải bao gồm cả chữ và số.');
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reset-password', {
        email: trimmedEmail,
        token: trimmedCode,
        password: trimmedPassword,
        password_confirmation: trimmedConfirm,
      });

      Alert.alert('Đặt lại thành công', 'Mật khẩu mới đã được cập nhật. Vui lòng đăng nhập lại.', [
        { text: 'Về đăng nhập', onPress: () => router.replace('/login') },
      ]);
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã và thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
              <MaterialCommunityIcons name="lock-reset" size={36} color={UI.colors.primary} />
            </View>
            <Text style={styles.appName}>Đặt lại mật khẩu</Text>
            <Text style={styles.appDesc}>
              {step === 'send-code'
                ? 'Nhập email để nhận mã đặt lại mật khẩu'
                : 'Nhập mã đã nhận và tạo mật khẩu mới'}
            </Text>
          </View>


          <View style={styles.card}>
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
                  keyboardType="email-address"
                />
              </View>
            </View>

            {step === 'reset-password' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mã đặt lại (8 ký tự)</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="shield-key-outline" size={20} color={UI.colors.textMuted} style={{marginRight: 10}}/>
                    <TextInput
                      style={[
                        styles.input,
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                      ]}
                      placeholder="VD: A7K9P2QX"
                      placeholderTextColor="#94a3b8"
                      value={code}
                      onChangeText={(t) => setCode(t.toUpperCase())}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu mới</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color={UI.colors.textMuted} style={{marginRight: 10}}/>
                    <TextInput
                      style={[
                        styles.input,
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                      ]}
                      placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                      placeholderTextColor="#94a3b8"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowNewPassword(!showNewPassword)}>
                      <MaterialCommunityIcons name={showNewPassword ? "eye-off" : "eye"} size={20} color={UI.colors.textMuted} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nhập lại mật khẩu mới</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="lock-check-outline" size={20} color={UI.colors.textMuted} style={{marginRight: 10}}/>
                    <TextInput
                      style={[
                        styles.input,
                        Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)
                      ]}
                      placeholder="Nhập lại mật khẩu"
                      placeholderTextColor="#94a3b8"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <MaterialCommunityIcons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color={UI.colors.textMuted} />
                    </Pressable>
                  </View>
                </View>
              </>
            ) : null}

            <Pressable 
              style={styles.submitBtn} 
              onPress={step === 'send-code' ? onSendCode : onResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff"/>
              ) : (
                <Text style={styles.submitText}>{step === 'send-code' ? 'Gửi mã đặt lại' : 'Cập nhật mật khẩu mới'}</Text>
              )}
            </Pressable>

            {step === 'reset-password' ? (
              <Pressable onPress={() => setStep('send-code')}>
                <Text style={[styles.linkText, { textAlign: 'center', marginTop: 14 }]}>Gửi lại mã khác</Text>
              </Pressable>
            ) : null}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Nhớ mật khẩu? </Text>
              <Pressable onPress={() => router.back()}>
                <Text style={styles.linkText}>Đăng nhập ngay</Text>
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

  submitBtn: {
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
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: UI.colors.textMuted, fontSize: 14, fontFamily: UI.font.body },
  linkText: { color: UI.colors.primaryDark, fontWeight: '800', fontSize: 14, fontFamily: UI.font.heading },
});
