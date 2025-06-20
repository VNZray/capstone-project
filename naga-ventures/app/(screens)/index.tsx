// TouristApp/(screens)/index.tsx
import React from 'react';
import { Text, View } from 'react-native';

export default function MobileFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Tourist App is not available on mobile yet.</Text>
    </View>
  );
}
