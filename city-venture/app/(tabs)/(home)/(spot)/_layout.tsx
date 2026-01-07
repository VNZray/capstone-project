import React from 'react';
import { Slot, Stack } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouristSpotProvider } from '@/context/TouristSpotContext';
import { StatusBar } from 'expo-status-bar';

export default function SpotLayout() {
  return (
    <>
      <StatusBar style="light" />
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
            headerTitle: '',
            headerBackTitle: 'Back',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#F9FAFB' },
            headerRight: () => (
              <View style={{ flexDirection: 'row', gap: 16, marginRight: 16 }}>
                <TouchableOpacity>
                  <View>
                    <Ionicons
                      name="notifications-outline"
                      size={24}
                      color="black"
                    />
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 2,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#007AFF',
                        borderWidth: 1,
                        borderColor: '#F9FAFB',
                      }}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Ionicons name="cart-outline" size={24} color="black" />
                </TouchableOpacity>
              </View>
            ),
          }}
        />
      </Stack>
    </>
  );
}
