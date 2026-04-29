// src/screens/ScheduleFormScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { api } from '../client';

export default function ScheduleFormScreen({ route, navigation }: any) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('2025-11-17 10:00:00');
  const [endTime, setEndTime] = useState('2025-11-17 11:00:00');

  const onSave = async () => {
    try {
      await api.post('/schedules', {
        title,
        start_time: startTime,
        end_time: endTime,
      });
      route.params?.onDone?.();
      navigation.goBack();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Tiêu đề</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
        value={title}
        onChangeText={setTitle}
      />
      <Text>Start time (YYYY-MM-DD HH:mm:ss)</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
        value={startTime}
        onChangeText={setStartTime}
      />
      <Text>End time</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 12 }}
        value={endTime}
        onChangeText={setEndTime}
      />
      <Button title="Lưu" onPress={onSave} />
    </View>
  );
}
