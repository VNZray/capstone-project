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
        <Stack.Screen
          name="business-profile"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="cart"
          options={{
            headerShown: true,
            animation: "slide_from_right",
            headerTitleAlign: "center",
            headerTitle: "Shopping Cart",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="product-details"
          options={{
            headerShown: true,
            animation: "slide_from_right",
            headerTitleAlign: "center",
            headerTitle: "Product Details",
            headerBackTitle: "Back",
          }}
        />
        <Stack.Screen
          name="categories"
          options={{
            headerShown: true,
            animation: "slide_from_right",
            headerTitleAlign: "center",
            headerTitle: "Categories",
            headerBackTitle: "Back",
          }}
        />
      </Stack>
    </ShopProvider>
  );
};

export default ShopLayout;
