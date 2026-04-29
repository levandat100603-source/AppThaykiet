import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/src/api/client';
import { UI } from '@/src/ui/design';

export default function VerifyEmail({ email }: { email: string }) {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [expired, setExpired] = useState(false);
    useEffect(() => {
      if (secondsLeft <= 0) {
        setExpired(true);
        return;
      }
      const timer = setInterval(() => setSecondsLeft(s => s - 1), 1000);
      return () => clearInterval(timer);
    }, [secondsLeft]);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 390;

  const onVerify = async () => {
    setError('');
    setSuccess('');

    if (!code || code.length !== 6) {
      setError('Vui lòng nhập mã xác thực 6 chữ số');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/verify-email', {
        email: email,
        code: code,
      });

      if (response.data.access_token) {
        router.replace('/');
      }
    } catch (e: any) {
      console.log('Lỗi xác thực:', e);

      let message = 'Có lỗi xảy ra, vui lòng thử lại';

      if (e.response?.data?.message) {
        message = e.response.data.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);
    setSecondsLeft(60);
    setExpired(false);
    try {
      await api.post('/send-verification-code', {
        email: email,
      });
      setSuccess('Mã xác thực mới đã được gửi đến email của bạn');
    } catch (e: any) {
      console.log('Lỗi gửi lại mã:', e);
      let message = 'Không thể gửi mã. Vui lòng thử lại';
      if (e.response?.data?.message) {
        message = e.response.data.message;
      }
      setError(message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.centerWrapper}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bgOrbA} />
        <View style={styles.bgOrbB} />
        <View style={[styles.card, { padding: isSmallPhone ? 20 : 40 }]}> 
          <View style={styles.header}>
            <View
              style={[
                styles.iconCircle,
                isSmallPhone && { width: 76, height: 76, borderRadius: 38, marginBottom: 16 },
              ]}
            >
              <MaterialCommunityIcons name="email-check" size={isSmallPhone ? 38 : 50} color={UI.colors.primary} />
            </View>
            <Text style={[styles.title, isSmallPhone && { fontSize: 24 }]}>Xác thực Email</Text>
            <Text style={styles.subtitle}>
              Mã xác thực đã được gửi đến
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Text style={styles.hint}>Vui lòng kiểm tra hộp thư và nhập mã 6 chữ số</Text>
            <Text style={{ color: expired ? UI.colors.danger : UI.colors.primary, fontWeight: '700', marginTop: 4, marginBottom: 4, fontFamily: UI.font.body }}>
              {expired
                ? 'Mã xác thực đã hết hạn. Vui lòng gửi lại mã mới!'
                : `Mã sẽ hết hạn sau ${secondsLeft} giây`}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#dc2626" style={{marginRight: 8}} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successBox}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#16a34a" style={{marginRight: 8}} />
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mã xác thực</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="numeric" size={24} color={UI.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
                  placeholder="• • • • • •"
                  placeholderTextColor="#cbd5e1"
                  value={code}
                  onChangeText={setCode}
                  maxLength={6}
                  keyboardType="numeric"
                  editable={!loading && !expired}
                  autoFocus
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, (loading || expired) && styles.buttonDisabled]}
              onPress={onVerify}
              disabled={loading || expired}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#fff" style={{marginRight: 8}} />
                  <Text style={styles.buttonText}>Xác thực ngay</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={onResendCode}
              disabled={resendLoading}
            >
              <MaterialCommunityIcons 
                name="email-sync" 
                size={18} 
                color={resendLoading ? '#94a3b8' : UI.colors.primaryDark} 
                style={{marginRight: 6}} 
              />
              <Text style={[styles.resendText, resendLoading && {color: '#94a3b8'}]}>
                {resendLoading ? 'Đang gửi...' : 'Gửi lại mã xác thực'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.colors.bg,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    overflow: 'hidden',
  },
  bgOrbA: {
    position: 'absolute',
    top: -90,
    left: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#d8efe9',
  },
  bgOrbB: {
    position: 'absolute',
    bottom: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#ffe5cf',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: UI.colors.surface,
    borderRadius: UI.radius.xl,
    borderWidth: 1,
    borderColor: UI.colors.border,
    ...UI.shadow.card,
    padding: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dff3ef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: UI.colors.text,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: UI.font.heading,
  },
  subtitle: {
    fontSize: 15,
    color: UI.colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: UI.font.body,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '700',
    color: UI.colors.primary,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: UI.font.body,
  },
  hint: {
    fontSize: 13,
    color: UI.colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    fontFamily: UI.font.body,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    padding: 16,
    marginBottom: 24,
    borderRadius: UI.radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    flex: 1,
    fontWeight: '600',
    fontFamily: UI.font.body,
  },
  successBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
    padding: 16,
    marginBottom: 24,
    borderRadius: UI.radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: {
    color: '#166534',
    fontSize: 14,
    flex: 1,
    fontWeight: '600',
    fontFamily: UI.font.body,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: UI.colors.textMuted,
    marginBottom: 10,
    fontFamily: UI.font.body,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: UI.colors.border,
    borderRadius: UI.radius.md,
    paddingHorizontal: 16,
    backgroundColor: UI.colors.surfaceMuted,
    height: 60,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: UI.colors.text,
    fontWeight: '600',
    letterSpacing: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: UI.colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: UI.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: UI.font.heading,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: UI.colors.border,
  },
  dividerText: {
    color: UI.colors.textMuted,
    fontSize: 13,
    marginHorizontal: 12,
    fontWeight: '600',
    fontFamily: UI.font.body,
  },
  resendButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: UI.radius.sm,
    backgroundColor: UI.colors.surfaceMuted,
    flexDirection: 'row',
  },
  resendText: {
    color: UI.colors.primaryDark,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: UI.font.body,
  },
});
