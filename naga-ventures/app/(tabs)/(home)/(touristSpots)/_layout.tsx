import { TouristSpotProvider } from "@/context/TouristSpotContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack } from "expo-router";
import React, { FC } from "react";
import { StatusBar } from "react-native";


const TouristSpotsLayout: FC = () => {
  const colorScheme = useColorScheme();
  return (
    <TouristSpotProvider>
      <StatusBar
        backgroundColor={colorScheme === "dark" ? "#000" : "#fff"}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerShown: true,
          headerTitle: "Tourist Spots",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            animation: "slide_from_right",
            headerTitleAlign: "center",
            headerTitle: "Tourist Spots",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="(categories)/[category]"
          options={{
            headerTitle: "Category",
            animation: "slide_from_right",
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="(spots)/[spotId]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </TouristSpotProvider>
  );
};

export default TouristSpotsLayout;