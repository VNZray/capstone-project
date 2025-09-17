import { Stack } from 'expo-router';
import React from 'react';

const SettingsLayout = () => {
  return (
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
            headerTitle: 'Account Settings',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
  )
}

export default SettingsLayout