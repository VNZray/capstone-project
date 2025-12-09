import Container from '@/components/Container';
import { AppHeader } from '@/components/header/AppHeader';
import HeaderButton from '@/components/header/HeaderButton';
import {
  AccommodationProvider,
  useAccommodation,
} from '@/context/AccommodationContext';
import { RoomProvider, useRoom } from '@/context/RoomContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
const AccommodationLayout = () => {
  const { accommodationDetails } = useAccommodation();
  const { roomDetails } = useRoom();
  const scheme = useColorScheme();
  const [favorite, setFavorite] = React.useState(false);

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  return (
    <AccommodationProvider>
      <RoomProvider>
        <Stack
          screenOptions={{
            headerBackVisible: false,
          }}
        >
          <Stack.Screen
            name="profile/profile"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
              header: () => (
                <AppHeader
                  backButton
                  title={accommodationDetails?.business_name}
                  background="transparent"
                  rightComponent={
                    <Container
                      padding={0}
                      direction="row"
                      backgroundColor="transparent"
                      align="center"
                      justify="flex-end"
                      gap={8}
                    >
                      <HeaderButton
                        onPress={toggleFavorite}
                        icon={favorite ? 'heart.fill' : 'heart'}
                      />
                      <HeaderButton icon="paperplane.fill" />
                    </Container>
                  }
                />
              ),
            }}
          />
          <Stack.Screen
            name="room/profile"
            options={{
              headerTransparent: true,
              headerShown: false,
              animation: 'slide_from_right',
              headerTitleAlign: 'center',
              headerTitleStyle: {
                color: '#fff',
              },
              headerTintColor: '#fff',
              header: () => (
                <AppHeader
                  backButton
                  title={roomDetails?.room_type}
                  background="transparent"
                />
              ),
            }}
          />

          <Stack.Screen
            name="room/booking/Summary"
            options={{
              headerShown: true,
              animation: 'slide_from_right',
              headerTitleAlign: 'center',
              headerTitle: 'Booking Summary',
              headerBackVisible: false,
            }}
          />
          {/* Payment result screens for deep links */}
          <Stack.Screen
            name="room/booking-success"
            options={{
              headerShown: false,
              animation: 'fade',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="room/(booking)"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="room/booking-cancel"
            options={{
              headerShown: false,
              animation: 'fade',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="index"
            options={{
              headerShown: true,
              animation: 'slide_from_right',
              headerTitleAlign: 'center',
              headerTitle: '',
              headerBackTitle: 'Back',
              headerBackVisible: true,
              headerShadowVisible: false,
              headerStyle: { backgroundColor: '#F9FAFB' },
              headerRight: () => (
                <View
                  style={{ flexDirection: 'row', gap: 16, marginRight: 16 }}
                >
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
      </RoomProvider>
    </AccommodationProvider>
  );
};

export default AccommodationLayout;
