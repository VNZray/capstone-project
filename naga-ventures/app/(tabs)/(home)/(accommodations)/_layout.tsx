import { AccommodationProvider } from "@/context/AccommodationContext";
import { BusinessProvider } from "@/context/BusinessContext";
import { Stack } from "expo-router";
import { View } from "react-native";
const accommodation = () => {};

const AccommodationLayout = () => {
  return (
    <BusinessProvider>
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
        }}
      >
        <Stack.Screen
          name="profile/[id]"
          options={{
            headerTransparent: true,
            headerShown: true,
            animation: "slide_from_right",
            headerTitleAlign: "center",
            headerTitleStyle: {
              color: "#fff",
            },
            headerTintColor: "#fff",
            headerBackground: () => (
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.4)", // translucent black
                }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="room/[id]"
          options={{
            headerTransparent: true,
            headerShown: true,
            animation: "slide_from_right",
            headerTitleAlign: "center",
            headerTitleStyle: {
              color: "#fff",
            },
            headerTintColor: "#fff",
            headerBackground: () => (
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.4)", // translucent black
                }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            animation: "slide_from_right",
            headerTitleAlign: "center",
            headerTitle: "Accommodation",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </BusinessProvider>
  );
};

export default AccommodationLayout;
