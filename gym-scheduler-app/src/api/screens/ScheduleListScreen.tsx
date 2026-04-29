// src/screens/ScheduleListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, RefreshControl } from 'react-native';
import { api } from '../client';

interface Schedule {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  trainer?: { user?: { name: string } };
}

export default function ScheduleListScreen({ navigation }: any) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadSchedules = async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/schedules');
      setSchedules(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Button
        title="Tạo lịch mới"
        onPress={() => navigation.navigate('ScheduleForm', { onDone: loadSchedules })}
      />
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadSchedules} />}
        renderItem={({ item }) => (
          <View
            style={{
              marginVertical: 8,
              padding: 12,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 8,
            }}
          >
            <Text style={{ fontWeight: '600' }}>{item.title || 'Buổi tập'}</Text>
            <Text>{item.start_time} - {item.end_time}</Text>
            <Text>Trạng thái: {item.status}</Text>
            <Text>HLV: {item.trainer?.user?.name || 'Chưa gán'}</Text>
          </View>
        )}
      />
    </View>
  );
}
