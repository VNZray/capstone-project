import { Stack } from 'expo-router';
export default function ReportsLayout(){
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="submit" />
      <Stack.Screen name="my-reports" />
      <Stack.Screen name="detail/[id]" />
    </Stack>
  );
}
