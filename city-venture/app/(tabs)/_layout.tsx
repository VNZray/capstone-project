// app/(tabs)/_layout.js
import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { Platform, Dimensions } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/color';
import { AccommodationProvider } from '@/context/AccommodationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const windowWidth = Dimensions.get('window').width;

  // Determine if current route is within the booking flow; hide tabs if so
  const hideTabs = React.useMemo(
    () => !!pathname && /\/room\/booking/i.test(pathname),
    [pathname]
  );

  // Responsive tab bar height and icon size
  const tabBarHeight = windowWidth < 360 ? 60 : windowWidth < 375 ? 65 : 70;
  const iconSize = windowWidth < 360 ? 26 : windowWidth < 375 ? 28 : 32;

  // Remove artificial loading delay for faster tab responses

  return (
    <AccommodationProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
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
                default: {
                  position: 'absolute',
                  paddingTop: 8,
                  paddingBottom: 5,
                  height: tabBarHeight,
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
              <IconSymbol size={iconSize} name="house.fill" color={color} />
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
              <IconSymbol size={iconSize} name="map.fill" color={color} />
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
              <IconSymbol size={iconSize} name="heart.fill" color={color} />
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
              <IconSymbol size={iconSize} name="person.crop.circle" color={color} />
            ),
          }}
        />
      </Tabs>
    </AccommodationProvider>
  );
}
