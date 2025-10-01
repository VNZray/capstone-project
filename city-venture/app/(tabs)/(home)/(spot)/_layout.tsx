import React from 'react';
import { Slot, Stack } from 'expo-router';
import { TouristSpotProvider } from '@/context/TouristSpotContext';
import { StatusBar } from 'expo-status-bar';

export default function SpotLayout() {
  return (
    <TouristSpotProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            animation: 'slide_from_right',
            headerTitleAlign: 'center',
            headerTitle: 'Tourist Spots',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </TouristSpotProvider>
  );
}
