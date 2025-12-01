import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import React from 'react';
import { View, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { colors } from '@/constants/color';

const Screens = () => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'light' ? '#000' : '#fff';
  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={colorScheme === 'light' ? DefaultTheme : DarkTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
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
