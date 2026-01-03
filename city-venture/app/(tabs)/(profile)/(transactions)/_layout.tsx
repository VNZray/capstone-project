import { AppHeader } from '@/components/header/AppHeader';
import { Stack } from 'expo-router';
import React from 'react';

const TransactionsLayout = () => {
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
          headerTitle: 'Trransactions',
          headerBackTitle: 'Back',
          header() {
            return (
              <AppHeader backButton title="Transactions" background="primary" />
            );
          },
        }}
      />
    </Stack>
  );
};

export default TransactionsLayout;
