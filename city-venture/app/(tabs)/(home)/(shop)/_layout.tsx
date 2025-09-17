import { ShopProvider } from "@/context/ShopContext";
import { Stack } from "expo-router";

const ShopLayout = () => {
  return (
    <ShopProvider>
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            animation: "slide_from_right",
            headerTitleAlign: "center",
            headerTitle: "Shop",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </ShopProvider>
  );
};

export default ShopLayout;
