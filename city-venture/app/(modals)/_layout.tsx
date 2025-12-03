import { Stack } from 'expo-router';

/**
 * Modal group layout - provides consistent modal presentation across the app.
 * These screens appear as modals over the current tab, enabling cross-tab
 * navigation without duplicating screens in each tab stack.
 */
export const unstable_settings = {
  // Default screen when navigating to (modals) without a specific route
  initialRouteName: 'business-profile/[id]',
};

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        animation: 'slide_from_bottom',
        headerShown: true,
        gestureEnabled: true,
        gestureDirection: 'vertical',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontFamily: 'Poppins-SemiBold',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="business-profile/[id]"
        options={{
          title: 'Business Details',
        }}
      />
      <Stack.Screen
        name="user-profile/[id]"
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="product-details/[id]"
        options={{
          title: 'Product Details',
        }}
      />
    </Stack>
  );
}
