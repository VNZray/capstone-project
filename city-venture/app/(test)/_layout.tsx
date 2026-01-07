// app/(tabs)/_layout.js
import { AppHeader } from '@/components/header/AppHeader';
import { Stack } from 'expo-router';
import React from 'react';

export default function TestLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          animation: 'ios_from_right',
          header() {
            return <AppHeader backButton title="Test" background="light" />;
          },
        }}
      />
    </Stack>
  );
}
