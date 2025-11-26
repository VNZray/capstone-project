// app/(tabs)/_layout.js
import { Tabs, router, usePathname } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/color';
import { AccommodationProvider } from '@/context/AccommodationContext';

import { WebLayout } from '@/components/layout/WebLayout';
export default function TabLayout() {
  const pathname = usePathname();

  // Determine if current route is within the booking flow; hide tabs if so
  const hideTabs = React.useMemo(
    () =>
      !!pathname &&
      (/\/room\/booking/i.test(pathname) || /\/cart/i.test(pathname)),
    [pathname]
  );

  // Remove artificial loading delay for faster tab responses

  return (
    <AccommodationProvider>
      <WebLayout>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors.light.tint,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: hideTabs
              ? { display: 'none' }
              : Platform.select({
                  ios: {
                    position: 'absolute',
                    paddingTop: 10,
                  },
                  web: {
                    display: 'none',
                  },
                  default: {
                    position: 'absolute',
                    paddingTop: 8,
                    paddingBottom: 5,
                    height: 70,
                  },
                }),
          }}
        >
          <Tabs.Screen
            name="(home)"
            options={{
              title: 'Home',
              headerTitle: 'City Venture',
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
      </WebLayout>
    </AccommodationProvider>
  );
}
