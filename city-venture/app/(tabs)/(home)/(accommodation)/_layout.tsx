import { AccommodationProvider } from '@/context/AccommodationContext';
import { RoomProvider } from '@/context/RoomContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
const AccommodationLayout = () => {
  const scheme = useColorScheme();
  return (
    <AccommodationProvider>
      <RoomProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerBackVisible: false,
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
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
            name="room/booking/Summary"
            options={{
              headerShown: true,
              animation: 'slide_from_right',
              headerTitleAlign: 'center',
              headerTitle: 'Booking Summary',
              headerBackVisible: false,
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
