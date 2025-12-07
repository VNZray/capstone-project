import { AppHeader } from '@/components/header/AppHeader';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks';
import { router, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

const AccountSecurityLayout = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const backgroundColor = isDark ? Colors.dark.primary : Colors.light.primary;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'Account Security',
          header() {
            return (
              <AppHeader
                backButton
                title="Account Security"
                background="primary"
              />
            );
          },
        }}
      />
    </Stack>
  );
};

export default AccountSecurityLayout;

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
