import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function AdminClassesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace({ pathname: '/admin/dashboard', params: { tab: 'classes' } } as any);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
