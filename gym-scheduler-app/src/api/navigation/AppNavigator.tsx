import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// src/api/navigation/AppNavigator.tsx
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ScheduleListScreen from '../screens/ScheduleListScreen';
import ScheduleFormScreen from '../screens/ScheduleFormScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Đăng nhập' }}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Đăng ký' }}
        />

        <Stack.Screen
          name="Schedules"
          component={ScheduleListScreen}
          options={{ title: 'Lịch tập' }}
        />

        <Stack.Screen
          name="ScheduleForm"
          component={ScheduleFormScreen}
          options={{ title: 'Tạo / sửa lịch' }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
