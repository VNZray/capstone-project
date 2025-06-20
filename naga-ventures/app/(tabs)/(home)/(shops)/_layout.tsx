import { Stack } from "expo-router";

const ShopDirectoryLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerShown: true,
        headerTitleAlign: "center",
        headerTitle: "Shop Directory",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "Shop Directory",
        }}
      />
      <Stack.Screen
        name="AllCategories"
        options={{
          headerShown: true,
          animation: "slide_from_right",
          headerTitleAlign: "center",
          headerTitle: "All Categories",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="(categories)/[category]"
        options={{
          headerShown: true,
          animation: "slide_from_right",
          headerTitleAlign: "center",
          headerTitle: "Category",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="(subcategory)/[subcategoryId]"
        options={{
          headerShown: true,
          animation: "slide_from_right",
          headerTitleAlign: "center",
          headerTitle: "Subcategory",
          headerBackTitle: "Back",
        }}
      />      
      <Stack.Screen
        name="(details)/[shopId]"
        options={{
          headerShown: false,
          animation: "slide_from_right",
          headerTitleAlign: "center",
          headerTitle: "Shop Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="FeaturedShops"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="RecommendedShops"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
};

export default ShopDirectoryLayout;