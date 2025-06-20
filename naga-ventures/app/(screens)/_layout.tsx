import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import React from 'react';

const Screens = () => {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#fff' : '#000';

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="LoadingScreen" options={{ headerShown: false }} />
      <Stack.Screen
        name="LoginPage"
        options={{
          headerBackTitle: 'Back',
          headerTitle: 'Login',
          headerTintColor: color,
          headerShown: true,
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="RegistrationPage"
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
  );
};

export default Screens;
