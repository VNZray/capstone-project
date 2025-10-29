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
      <Stack.Screen name="index" options={{ title: 'Reports' }} />
      <Stack.Screen name="my-reports" options={{ title: 'My Reports' }} />
      <Stack.Screen name="submit" options={{ title: 'Submit a Report' }} />
      <Stack.Screen name="detail/[id]" options={{ title: 'Report Detail' }} />
    </Stack>
  );
}
