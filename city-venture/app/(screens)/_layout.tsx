import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';

const Screens = () => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'light' ? '#000' : '#fff';

  return (
      <ThemeProvider value={colorScheme === 'light' ? DefaultTheme : DarkTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="Login"
          options={{
            headerBackTitle: 'Back',
            headerTitle: 'Login',
            headerTintColor: color,
            headerShown: true,
            title: 'Login',
            // Prevent iOS back-swipe and back button after successful login
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Register"
          options={{
            headerBackTitle: 'Back',
            headerTintColor: color,
            headerShown: true,
            title: 'Sign Up',
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
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
};

export default Screens;
