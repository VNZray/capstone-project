import { Stack } from 'expo-router';

const ProfileLayout = () => {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerBackTitle: 'Back',
        headerShown: true,
        headerTitle: 'Profile',
      }}
    >
      {/* Ensure the Profile tab defaults to this screen */}
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          animation: 'default',
          headerTitleAlign: 'center',
          headerTitle: 'Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="(bookings)"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'Bookings',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="(transactions)"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'Transactions',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="(edit)"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="(settings)"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'Settings',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
};

export default ProfileLayout;
