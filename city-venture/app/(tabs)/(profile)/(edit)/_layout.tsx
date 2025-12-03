import { Stack } from 'expo-router';
import React from 'react';

const EditLayout = () => {
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
          headerTitle: 'Edit Profile',
        }}
      />
    </Stack>
  );
};

export default EditLayout;
