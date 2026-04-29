import { Stack } from 'expo-router';

export default function TrainerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="availability" />
      <Stack.Screen name="earnings" />
      <Stack.Screen name="clients" />
      <Stack.Screen name="client-management" />
    </Stack>
  );
}



