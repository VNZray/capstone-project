// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import Loading from '@/components/Loading';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/color';
import { AccommodationProvider } from '@/context/AccommodationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate an asynchronous loading process
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust the time as needed
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <Loading />
      </View>
    );
  }

  return (
    <AccommodationProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              paddingTop: 10,
            },
            default: {
              position: 'absolute',
              paddingTop: 8,
              height: 70,
            },
          }),
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Home',
            headerTitle: 'Naga Venture',
            headerShown: false,
            animation: 'shift',
            headerTitleAlign: 'left',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={32} name="house.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="maps/index"
          options={{
            title: 'Maps',
            headerShown: true,
            animation: 'shift',
            headerTitleAlign: 'center',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={32} name="map.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="favorite/index"
          options={{
            title: 'Favorites',
            headerShown: true,
            animation: 'shift',
            headerTitleAlign: 'center',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={32} name="heart.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="(profile)"
          options={{
            title: 'Profile',
            headerTitle: 'User Profile',
            headerShown: false,
            animation: 'shift',
            headerTitleAlign: 'left',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={32} name="person.crop.circle" color={color} />
            ),
          }}
        />
      </Tabs>
    </AccommodationProvider>
  );
}
