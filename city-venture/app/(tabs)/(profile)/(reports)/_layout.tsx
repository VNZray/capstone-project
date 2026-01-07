import { AppHeader } from '@/components/header/AppHeader';
import { Stack } from 'expo-router';

export default function ReportsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTitleAlign: 'center',
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Reports',
          headerShown: true,
          animation: 'slide_from_right',
          header() {
            return <AppHeader backButton title="Report" background="primary" />;
          },
        }}
      />
      <Stack.Screen
        name="my-reports"
        options={{
          title: 'My Reports',
          headerShown: false,
          animation: 'slide_from_right',
          header() {
            return (
              <AppHeader backButton title="My Reports" background="primary" />
            );
          },
        }}
      />
      <Stack.Screen
        name="submit"
        options={{
          title: 'Submit a Report',
          headerShown: true,
          animation: 'slide_from_right',
          header() {
            return (
              <AppHeader
                backButton
                title="Submit Report"
                background="primary"
              />
            );
          },
        }}
      />
      <Stack.Screen
        name="detail/[id]"
        options={{
          title: 'Report Detail',
          headerShown: true,
          animation: 'slide_from_right',
          header() {
            return (
              <AppHeader
                backButton
                title="Report Detail"
                background="primary"
              />
            );
          },
        }}
      />
    </Stack>
  );
}
