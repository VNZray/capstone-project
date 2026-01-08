import { AppHeader } from '@/components/header/AppHeader';
import { Stack } from 'expo-router';

const EventsLayout = () => {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerBackTitle: 'Back',
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'Events',
          headerBackTitle: 'Back',
          header() {
            return <AppHeader backButton title="Events" background="primary" />;
          },
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          animation: 'slide_from_right',
          headerTitleAlign: 'center',
          headerTitle: 'Event Details',
          headerBackTitle: 'Back',
          header() {
            return (
              <AppHeader backButton title="Event Details" background="primary" />
            );
          },
        }}
      />
    </Stack>
  );
};

export default EventsLayout;
