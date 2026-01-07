// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useNavigationContext } from '@/context/NavigationContext';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/color';
import { AccommodationProvider } from '@/context/AccommodationContext';
import { RoomProvider } from '@/context/RoomContext';
import { TouristSpotProvider } from '@/context/TouristSpotContext';

export default function TabLayout() {
  const { tabsVisible } = useNavigationContext();

  return (
    <TouristSpotProvider>
      <AccommodationProvider>
        <RoomProvider>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: Colors.light.tint,
              headerShown: false,
              tabBarButton: HapticTab,
              tabBarBackground: TabBarBackground,
              tabBarStyle: !tabsVisible
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
                popToTopOnBlur: true,
                tabBarIcon: ({ color }) => (
                  <IconSymbol size={32} name="house.fill" color={color} />
                ),
              }}
            />

            <Tabs.Screen
              name="(maps)"
              options={{
                title: 'Maps',
                headerShown: false,
                animation: 'shift',
                headerTitleAlign: 'center',
                tabBarIcon: ({ color }) => (
                  <IconSymbol size={32} name="map.fill" color={color} />
                ),
              }}
            />

            <Tabs.Screen
              name="(favorite)"
              options={{
                title: 'Favorites',
                headerShown: false,
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
                popToTopOnBlur: true,
                tabBarIcon: ({ color }) => (
                  <IconSymbol
                    size={32}
                    name="person.crop.circle"
                    color={color}
                  />
                ),
              }}
            />
          </Tabs>
        </RoomProvider>
      </AccommodationProvider>
    </TouristSpotProvider>
  );
}
