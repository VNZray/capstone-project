import { Stack } from "expo-router";

const HomeLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerShown: true,
        headerTitle: "Naga Venture",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="(accommodation)"
        options={{
          headerShown: false,
          animation: "slide_from_right",
          headerTitleAlign: "center",
          headerTitle: "Accommodation Directory",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="(event)"
        options={{
          headerShown: false,
          animation: "slide_from_right",
          headerTitleAlign: "center",
          headerTitle: "Event Directory",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="(shop)"
        options={{
          headerShown: false,
          animation: "slide_from_right",
          headerTitleAlign: "center",
          headerTitle: "Shop Directory",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="(spot)"
        options={{
          headerShown: false,
          animation: "slide_from_right",
          headerTitleAlign: "center",
          headerTitle: "Tourist Spots",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
};

export default HomeLayout;
