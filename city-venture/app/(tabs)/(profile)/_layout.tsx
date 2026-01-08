import { AppHeader } from '@/components/header/AppHeader';
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
          headerShown: true,
          animation: 'default',
          headerTitleAlign: 'center',
          headerTitle: 'Profile',
          headerBackTitle: 'Back',
          header() {
            return (
              <AppHeader backButton title="Profile" background="primary" />
            );
          },
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
        name="(events)"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'Events',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="(notifications)"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'Notifications',
          headerBackTitle: 'Back',
          header() {
            return (
              <AppHeader
                backButton
                title="Notifications"
                background="primary"
              />
            );
          },
        }}
      />
      <Stack.Screen
        name="(account)"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'My Account',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="(reviews)"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'My Reviews',
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
      <Stack.Screen
        name="(reports)"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          header() {
            return <AppHeader backButton title="Report" background="primary" />;
          },
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          header() {
            return (
              <AppHeader backButton title="My Orders" background="primary" />
            );
          },
        }}
      />
      <Stack.Screen
        name="(security)"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'Account Security',
          headerBackTitle: 'Back',
          header() {
            return (
              <AppHeader backButton title="My Account" background="primary" />
            );
          },
        }}
      />
      <Stack.Screen
        name="(rate-app)"
        options={{
          headerShown: true,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          header() {
            return (
              <AppHeader backButton title="Rate App" background="primary" />
            );
          },
        }}
      />
      <Stack.Screen
        name="(terms-and-conditions)"
        options={{
          headerShown: true,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          header() {
            return (
              <AppHeader
                backButton
                title="Terms and Conditions"
                background="primary"
              />
            );
          },
        }}
      />
      <Stack.Screen
        name="(privacy-policy)"
        options={{
          headerShown: true,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          header() {
            return (
              <AppHeader
                backButton
                title="Privacy Policy"
                background="primary"
              />
            );
          },
        }}
      />
    </Stack>
  );
};

export default ProfileLayout;
