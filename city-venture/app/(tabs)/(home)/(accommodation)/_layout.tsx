import { AccommodationProvider } from '@/context/AccommodationContext';
import { RoomProvider } from '@/context/RoomContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

const AccommodationLayout = () => {
  return (
    <AccommodationProvider>
      <RoomProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerBackTitle: 'Back',
          }}
        >
          <Stack.Screen
            name="profile/profile"
            options={{
              headerTransparent: true,
              headerShown: true,
              animation: 'slide_from_right',
              headerTitleAlign: 'center',
              headerTitleStyle: {
                color: '#fff',
              },
              headerTintColor: '#fff',
              headerBackground: () => (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', // translucent black
                  }}
                />
              ),
            }}
          />
          <Stack.Screen
            name="room/profile"
            options={{
              headerTransparent: true,
              headerShown: true,
              animation: 'slide_from_right',
              headerTitleAlign: 'center',
              headerTitleStyle: {
                color: '#fff',
              },
              headerTintColor: '#fff',
              headerBackground: () => (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)', // translucent black
                  }}
                />
              ),
            }}
          />
          <Stack.Screen
            name="index"
            options={{
              headerShown: true,
              animation: 'slide_from_right',
              headerTitleAlign: 'center',
              headerTitle: 'Accommodation',
              headerBackTitle: 'Back',
            }}
          />
        </Stack>
      </RoomProvider>
    </AccommodationProvider>
  );
};

export default AccommodationLayout;
