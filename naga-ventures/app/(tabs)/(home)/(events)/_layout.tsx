import { AccommodationProvider } from "@/context/AccommodationContext";
import { Stack } from "expo-router";

const EventLayout = () => {
  return (
    <AccommodationProvider>
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerShown: true,
          headerTitle: `Event $(eventName)`,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            animation: "slide_from_right",
            headerTitleAlign: "center",
            headerTitle: "Events",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </AccommodationProvider>
  );
};

export default EventLayout;
