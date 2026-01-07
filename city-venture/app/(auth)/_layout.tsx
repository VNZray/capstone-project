import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';

/**
 * Auth Layout - Stack navigator for unauthenticated user flows.
 * Contains login, registration, and password reset screens.
 */
export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'light' ? '#000' : '#fff';

  return (
    <ThemeProvider value={colorScheme === 'light' ? DefaultTheme : DarkTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            title: 'Sign In',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerBackTitle: 'Back',
            headerTintColor: color,
            headerShown: false,
            title: 'Sign Up',
          }}
        />
        <Stack.Screen
          name="forgot-password"
          options={{
            headerBackTitle: 'Back',
            headerTintColor: color,
            headerShown: true,
            title: 'Forgot Password',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
