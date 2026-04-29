import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const TIME_SLOTS: any = {
  'Sáng': ['06:00', '07:30', '09:00', '10:30'],
  'Chiều': ['13:30', '15:00', '16:30'],
  'Tối': ['18:00', '19:30', '21:00'],
};

export default function TrainerBookingForm({ trainer, onClose }: { trainer: any, onClose: () => void }) {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const availableShifts = trainer.availability ? trainer.availability.split(', ').map((s: string) => s.trim()) : [];

  // Hàm xử lý khi chọn ngày trên Mobile
  const onChangeDateMobile = (event: any, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      setDate(selectedDate);
    }
    if (Platform.OS === 'android') {
      setShowPicker(false); // Android chọn xong tự đóng
    }
  };

  const normalizeTimeToDate = (baseDate: Date, time: string) => {
    const [hour, minute] = time.split(':').map((v: string) => parseInt(v, 10));
    const d = new Date(baseDate);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  const isTimeDisabled = (time: string) => {
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    if (!sameDay) return false;
    const dt = normalizeTimeToDate(date, time);
    return dt <= now;
  };

  const handleSelectTime = (time: string) => {
    if (isTimeDisabled(time)) return;
    setSelectedTime(time);
  };

  const displayDate = date.toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleBooking = () => {
    if (!selectedShift || !selectedTime) {
      Alert.alert("Chưa chọn xong", "Vui lòng chọn đầy đủ ca tập và giờ tập.");
      return;
    }
    const dateString = date.toISOString().split('T')[0];
    Alert.alert("Thành công", `Đã đặt HLV ${trainer.name}\nNgày: ${dateString}\nLúc: ${selectedTime}`);
    onClose();
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Đặt lịch tập</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={24} color="#64748b" />
        </Pressable>
      </View>
      
      <Text style={styles.trainerNameLabel}>HLV: {trainer.name}</Text>

      {/* --- 1. PHẦN CHỌN NGÀY (Xử lý riêng Web và Mobile) --- */}
      <Text style={styles.label}>Ngày tập:</Text>
      
      {Platform.OS === 'web' ? (
        // GIAO DIỆN WEB: Dùng thẻ input date chuẩn HTML
        <View style={styles.datePickerPlaceholder}>
          <View style={styles.datePickerRow}>
            <Feather name="calendar" size={20} color="#2563eb" style={{ marginRight: 10 }} />
            <input
              type="date"
              value={date.toISOString().split('T')[0]}
              min={new Date().toISOString().split('T')[0]}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: 16,
                color: '#0f172a',
                flex: 1,
                fontFamily: 'System',
                backgroundColor: 'transparent'
              }}
              onChange={(e) => setDate(new Date(e.target.value))}
            />
          </View>
        </View>
      ) : (
        // GIAO DIỆN MOBILE: Dùng DateTimePicker Native
        <>
          <Pressable 
            style={styles.datePickerPlaceholder}
            onPress={() => setShowPicker(true)}
          >
            <Feather name="calendar" size={20} color="#2563eb" style={{ marginRight: 10 }} />
            <Text style={styles.dateText}>{displayDate}</Text>
            <Feather name="chevron-down" size={20} color="#64748b" />
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onChangeDateMobile}
              minimumDate={new Date()}
            />
          )}
        </>
      )}

      {/* --- 2. Chọn Ca tập --- */}
      <Text style={styles.label}>Chọn ca rảnh:</Text>
      <View style={styles.chipsContainer}>
        {availableShifts.map((shift: string) => {
           const isSelected = selectedShift === shift;
           return (
            <Pressable
              key={shift}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => { setSelectedShift(shift); setSelectedTime(''); }}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{shift}</Text>
              {isSelected && <Feather name="check" size={16} color="white" style={{marginLeft: 4}}/>}
            </Pressable>
          )
        })}
      </View>

      {/* --- 3. Chọn Giờ --- */}
      {selectedShift && (
        <>
          <Text style={styles.label}>Khung giờ {selectedShift.toLowerCase()}:</Text>
          <View style={styles.chipsContainer}>
            {TIME_SLOTS[selectedShift].map((time: string) => {
               const isSelected = selectedTime === time;
               const disabled = isTimeDisabled(time);
               return (
                <Pressable
                  key={time}
                  disabled={disabled}
                  style={[styles.timeSlotChip, isSelected && styles.chipSelected, disabled && { opacity: 0.4 }]}
                  onPress={() => handleSelectTime(time)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{time}</Text>
                </Pressable>
              )
            })}
          </View>
        </>
      )}

      <View style={styles.modalFooter}>
        <Pressable style={styles.btnActionConfirm} onPress={handleBooking}>
          <Text style={styles.btnActionText}>Xác nhận đặt lịch</Text>
          <Feather name="arrow-right" size={20} color="white" style={{marginLeft: 8}} />
        </Pressable>
      </View>
    </View>
  );
}

// ... Giữ nguyên phần styles bên dưới ...
const styles = StyleSheet.create({
  modalContainer: { padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  closeButton: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 50 },
  trainerNameLabel: { fontSize: 16, color: '#2563eb', fontWeight: '600', marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 12, marginTop: 8 },
  
  datePickerPlaceholder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, backgroundColor: '#f8fafc' },
  datePickerRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dateText: { fontSize: 16, color: '#0f172a', flex: 1, fontWeight: '500' },
  
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 30, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center' },
  timeSlotChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1' },
  chipSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb', shadowColor: '#2563eb', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  chipText: { color: '#64748b', fontWeight: '600', fontSize: 14 },
  chipTextSelected: { color: '#fff' },

  modalFooter: { marginTop: 30 },
  btnActionConfirm: { backgroundColor: '#2563eb', padding: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', shadowColor: '#2563eb', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  btnActionText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});