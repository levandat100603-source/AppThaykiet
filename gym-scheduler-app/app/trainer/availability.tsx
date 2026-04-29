import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTrainerManagement } from '../../src/hooks/useTrainerManagement';
import { useAuth } from '../../src/api/context/AuthContext';

const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

export default function TrainerAvailabilityScreen() {
  const { trainerId } = useLocalSearchParams();
  const { user } = useAuth();
  const parsedTrainerId = typeof trainerId === 'string' ? parseInt(trainerId, 10) : NaN;
  const id = Number.isFinite(parsedTrainerId) ? parsedTrainerId : (user?.id ?? 0);

  const {
    workingHours,
    loading,
    error,
    fetchWorkingHours,
    saveWorkingHours,
  } = useTrainerManagement(id);

  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState('07:00');
  const [selectedEndTime, setSelectedEndTime] = useState('17:00');
  const [selectedIsActive, setSelectedIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  const normalizeTime = (value?: string) => (value ? value.slice(0, 5) : '07:00');
  const isValidTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

  useEffect(() => {
    if (!id) {
      return;
    }

    fetchWorkingHours();
  }, [id, fetchWorkingHours]);

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Không xác định được trainer hiện tại.</Text>
      </View>
    );
  }

  const handleSaveWorkingHour = async (dayOfWeek: number, startTime: string, endTime: string, isActive: boolean) => {
    setFormError('');
    const normalizedStartTime = normalizeTime(startTime);
    const normalizedEndTime = normalizeTime(endTime);

    if (isActive) {
      if (!isValidTime(normalizedStartTime) || !isValidTime(normalizedEndTime)) {
        const message = 'Giờ chỉ được trong khoảng 00:00 - 23:59';
        setFormError(message);
        Alert.alert('Lỗi', message);
        return;
      }

      if (normalizedStartTime >= normalizedEndTime) {
        const message = 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc';
        setFormError(message);
        Alert.alert('Lỗi', message);
        return;
      }
    }

    try {
      await saveWorkingHours([
        {
          trainer_id: id,
          day_of_week: dayOfWeek,
          start_time: normalizedStartTime,
          end_time: normalizedEndTime,
          is_active: isActive,
        },
      ]);
      Alert.alert('Thành công', isActive ? 'Đã đăng ký lịch làm' : 'Đã đặt ngày này thành off');
      setEditingDay(null);
    } catch (err: any) {
      const message = err.message || 'Không thể lưu lịch làm';
      setFormError(message);
      Alert.alert('Lỗi', message);
    }
  };

  const openScheduleEditor = (dayOfWeek: number) => {
    const currentHour = workingHours.find((h) => h.day_of_week === dayOfWeek);
    setSelectedStartTime(normalizeTime(currentHour?.start_time));
    setSelectedEndTime(normalizeTime(currentHour?.end_time));
    setSelectedIsActive(currentHour?.is_active !== false);
    setFormError('');
    setEditingDay(dayOfWeek);
  };

  const renderWorkingHoursTab = () => (
    <ScrollView style={styles.tabContent}>
      {DAYS_OF_WEEK.map((day, index) => {
        const hourData = workingHours.find((h) => h.day_of_week === index);
        return (
          <View key={index} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{day}</Text>
            </View>
            {hourData ? (
              <View style={styles.timeDisplay}>
                <Text style={styles.timeText}>
                  {hourData.is_active === false ? 'Off' : `${hourData.start_time} - ${hourData.end_time}`}
                </Text>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditingDay(index)}
                >
                  <Text style={styles.editButtonText}>Chỉnh sửa</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => openScheduleEditor(index)}
              >
                <Text style={styles.addButtonText}>+ Đăng ký lịch làm</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );

  if (loading && workingHours.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.pageTitle}>Đăng ký lịch làm</Text>
        <Text style={styles.pageDesc}>Chọn ngày và nhập giờ bắt đầu - kết thúc cho lịch làm của bạn</Text>
      </View>

      {error ? (
        <View style={styles.pageErrorBox}>
          <Text style={styles.pageErrorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              fetchWorkingHours();
            }}
          />
        }
      >
        {renderWorkingHoursTab()}
      </ScrollView>

      <Modal
        visible={editingDay !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingDay(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingDay !== null ? DAYS_OF_WEEK[editingDay] : 'Đăng ký lịch làm'}
            </Text>
            <Text style={styles.modalSubtitle}>Nhập giờ theo định dạng HH:mm, ví dụ 07:00</Text>
            {formError ? <Text style={styles.modalErrorText}>{formError}</Text> : null}
            {!selectedIsActive && (
              <Text style={styles.offHint}>Đang Off, không thể nhập giờ</Text>
            )}

            <TouchableOpacity
              style={[styles.offToggle, selectedIsActive === false && styles.offToggleActive]}
              onPress={() => setSelectedIsActive((current) => !current)}
            >
              <Text style={[styles.offToggleText, selectedIsActive === false && styles.offToggleTextActive]}>
                {selectedIsActive ? 'Off' : 'On'}
              </Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giờ bắt đầu</Text>
              <TextInput
                style={[styles.timeInput, !selectedIsActive && styles.timeInputDisabled]}
                value={selectedStartTime}
                onChangeText={setSelectedStartTime}
                placeholder="07:00"
                placeholderTextColor="#94a3b8"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                editable={selectedIsActive}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Giờ kết thúc</Text>
              <TextInput
                style={[styles.timeInput, !selectedIsActive && styles.timeInputDisabled]}
                value={selectedEndTime}
                onChangeText={setSelectedEndTime}
                placeholder="17:00"
                placeholderTextColor="#94a3b8"
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                editable={selectedIsActive}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setEditingDay(null)}>
                <Text style={styles.secondaryButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  if (editingDay === null) return;
                  handleSaveWorkingHour(editingDay, selectedStartTime.trim(), selectedEndTime.trim(), selectedIsActive);
                }}
              >
                <Text style={styles.primaryButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerBox: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  pageDesc: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  pageErrorBox: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  pageErrorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '700',
  },
  tabContent: {
    padding: 16,
  },
  dayCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dayStatus: {
    fontSize: 12,
    color: '#999',
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  offToggle: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  offToggleActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fee2e2',
  },
  offToggleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  offToggleTextActive: {
    color: '#b91c1c',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 13,
    color: '#6b7280',
  },
  modalErrorText: {
    marginBottom: 12,
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '700',
  },
  offHint: {
    marginBottom: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#b91c1c',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  timeInputDisabled: {
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
