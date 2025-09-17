import { Stack } from 'expo-router';
import React from 'react';

const BookingsLayout = () => {
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
            headerTitle: 'My Bookings',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
  );
};

export default BookingsLayout;
