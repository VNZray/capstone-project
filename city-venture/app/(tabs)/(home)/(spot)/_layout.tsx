import React from 'react';
import { Slot } from 'expo-router';
import { TouristSpotProvider } from '@/context/TouristSpotContext';

export default function SpotLayout() {
  return (
    <TouristSpotProvider>
      <Slot />
    </TouristSpotProvider>
  );
}