import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/api/context/AuthContext';
import { api } from '../../src/api/client';
import { UI, getThemeColors } from '../../src/ui/design';
import { useThemeMode } from '../../src/ui/theme-mode';

type UserHistoryResponse = {
  user_info?: {
    name?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  };
  membership?: {
    package?: string;
    expiry?: string;
  };
};

const API_ORIGIN = (() => {
  const baseURL = api.defaults.baseURL;
  if (!baseURL) return null;
  try {
    return new URL(baseURL).origin;
  } catch {
    return null;
  }
})();

const normalizeImageUrl = (url?: string) => {
  if (!url) return 'https://via.placeholder.com/160';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/') && API_ORIGIN) return `${API_ORIGIN}${url}`;
  return url;
};

const showMessage = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
    return;
  }
  Alert.alert(title, message);
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateLocalUser } = useAuth();
  const { isDark } = useThemeMode();
  const colors = getThemeColors(isDark);

  const [history, setHistory] = useState<UserHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const membershipLabel = useMemo(() => {
    const pack = history?.membership?.package || 'Thành viên thường';
    if (!history?.membership?.expiry) return pack;
    return `${pack} • Hết hạn ${new Date(history.membership.expiry).toLocaleDateString('vi-VN')}`;
  }, [history]);

  const fetchProfileData = useCallback(async () => {
    try {
      const res = await api.get('/user/history');
      const data = res.data || {};
      setHistory(data);
      setName(data?.user_info?.name || user?.name || '');
      setPhone(data?.user_info?.phone || '');
    } catch (error: any) {
      console.log('Lỗi tải hồ sơ:', error?.response?.status, error?.response?.data || error?.message);
      showMessage('Lỗi', 'Không thể tải thông tin hồ sơ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.name]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user, fetchProfileData]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchProfileData();
      }
    }, [user, fetchProfileData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleSaveProfile = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      showMessage('Thiếu thông tin', 'Vui lòng nhập họ tên.');
      return;
    }

    if (trimmedPhone && !/^[0-9+\-\s]{8,20}$/.test(trimmedPhone)) {
      showMessage('Số điện thoại không hợp lệ', 'Số điện thoại chỉ gồm số và ký tự + - khoảng trắng.');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await api.put('/user/profile', {
        name: trimmedName,
        phone: trimmedPhone || null,
      });

      const updatedUser = res?.data?.user;
      if (updatedUser) {
        await updateLocalUser({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        });
      }

      setHistory((prev) => ({
        ...(prev || {}),
        user_info: {
          ...(prev?.user_info || {}),
          name: trimmedName,
          phone: trimmedPhone || undefined,
        },
      }));

      showMessage('Thành công', 'Đã cập nhật hồ sơ.');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể cập nhật hồ sơ.';
      showMessage('Lỗi', message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePickAndUploadAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;
      const localUri = result.assets[0].uri;

      setUploadingAvatar(true);
      const multipart = new FormData();

      if (Platform.OS === 'web' && localUri.startsWith('blob:')) {
        const response = await fetch(localUri);
        const blob = await response.blob();
        multipart.append('avatar', blob as any, 'avatar.jpg');
      } else {
        const filename = localUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename.toLowerCase());
        const ext = match?.[1] || 'jpg';
        const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

        multipart.append('avatar', {
          uri: localUri,
          name: filename,
          type: mime,
        } as any);
      }

      const res = await api.post('/user/avatar', multipart, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const nextAvatar = res?.data?.avatar;
      if (nextAvatar) {
        setHistory((prev) => ({
          ...(prev || {}),
          user_info: {
            ...(prev?.user_info || {}),
            avatar: nextAvatar,
          },
        }));
        await updateLocalUser({ avatar: nextAvatar });
      }

      showMessage('Thành công', 'Đã cập nhật ảnh đại diện.');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể cập nhật ảnh đại diện.';
      showMessage('Lỗi', message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleChangePassword = async () => {
    const oldPwd = currentPassword.trim();
    const nextPwd = newPassword.trim();
    const confirmPwd = confirmPassword.trim();

    if (!oldPwd || !nextPwd || !confirmPwd) {
      showMessage('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }

    if (nextPwd.length < 6) {
      showMessage('Mật khẩu yếu', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (nextPwd !== confirmPwd) {
      showMessage('Không khớp', 'Xác nhận mật khẩu mới chưa đúng.');
      return;
    }

    try {
      setSavingPassword(true);
      await api.post('/user/change-password', {
        current_password: oldPwd,
        new_password: nextPwd,
        new_password_confirmation: confirmPwd,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('Thành công', 'Đổi mật khẩu thành công.');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không thể đổi mật khẩu.';
      showMessage('Lỗi', message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerLoad, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Image
            source={{ uri: normalizeImageUrl(history?.user_info?.avatar) }}
            style={styles.avatar}
          />
          <Pressable
            style={[styles.avatarButton, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }, uploadingAvatar && styles.buttonDisabled]}
            onPress={handlePickAndUploadAvatar}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <MaterialCommunityIcons name="image-edit-outline" size={18} color={colors.primary} />
                <Text style={[styles.avatarButtonText, { color: colors.primary }]}>Đổi ảnh đại diện</Text>
              </>
            )}
          </Pressable>
          <Text style={[styles.userName, { color: colors.text }]}>{history?.user_info?.name || user?.name || 'Người dùng'}</Text>
          <Text style={[styles.userEmail, { color: colors.textMuted }]}>{history?.user_info?.email || user?.email || ''}</Text>
          {(user?.role === 'member' || user?.role === 'user') && (
            <View style={[styles.memberTag, { backgroundColor: isDark ? '#713f12' : '#fef9c3' }]}>
              <MaterialCommunityIcons name="crown" size={16} color="#ca8a04" />
              <Text style={styles.memberText}>{membershipLabel}</Text>
            </View>
          )}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account-edit" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin cá nhân</Text>
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>Họ và tên</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
            value={name}
            onChangeText={setName}
            placeholder="Nhập họ và tên"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled, { color: colors.textMuted, borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
            value={history?.user_info?.email || user?.email || ''}
            editable={false}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>Số điện thoại</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Ví dụ: 0901234567"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />

          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }, savingProfile && styles.buttonDisabled]}
            onPress={handleSaveProfile}
            disabled={savingProfile}
          >
            {savingProfile ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Lưu thay đổi</Text>}
          </Pressable>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="shield-lock-outline" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Đổi mật khẩu</Text>
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>Mật khẩu hiện tại</Text>
          <View style={[styles.passwordWrap, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.text }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPwd}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor={colors.textMuted}
            />
            <Pressable onPress={() => setShowCurrentPwd((v) => !v)}>
              <MaterialCommunityIcons name={showCurrentPwd ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>Mật khẩu mới</Text>
          <View style={[styles.passwordWrap, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.text }]}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPwd}
              placeholder="Ít nhất 6 ký tự"
              placeholderTextColor={colors.textMuted}
            />
            <Pressable onPress={() => setShowNewPwd((v) => !v)}>
              <MaterialCommunityIcons name={showNewPwd ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={[styles.label, { color: colors.textMuted }]}>Xác nhận mật khẩu mới</Text>
          <View style={[styles.passwordWrap, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPwd}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor={colors.textMuted}
            />
            <Pressable onPress={() => setShowConfirmPwd((v) => !v)}>
              <MaterialCommunityIcons name={showConfirmPwd ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.primaryButton, { backgroundColor: '#0f766e' }, savingPassword && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={savingPassword}
          >
            {savingPassword ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Cập nhật mật khẩu</Text>}
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.colors.bg },
  centerLoad: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40, maxWidth: 920, marginHorizontal: 'auto', width: '100%' },

  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
    ...UI.shadow.card,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10, borderWidth: 2, borderColor: '#e2e8f0' },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  avatarButtonText: { fontSize: 13, fontWeight: '700', fontFamily: UI.font.body },
  userName: { fontSize: 24, fontWeight: '800', fontFamily: UI.font.heading },
  userEmail: { marginTop: 3, marginBottom: 10, fontSize: 14, fontFamily: UI.font.body },
  memberTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  memberText: { color: '#854d0e', fontWeight: '700', fontSize: 13, fontFamily: UI.font.body },

  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '800', fontFamily: UI.font.heading },
  helperText: { fontSize: 14, lineHeight: 21, marginBottom: 12, fontFamily: UI.font.body },

  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, fontFamily: UI.font.body },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 15,
    fontFamily: UI.font.body,
  },
  inputDisabled: { opacity: 0.8 },

  passwordWrap: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: { flex: 1, fontSize: 15, fontFamily: UI.font.body },

  primaryButton: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', fontFamily: UI.font.heading },
  buttonDisabled: { opacity: 0.7 },

  secondaryButton: {
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '700', fontFamily: UI.font.heading },
});