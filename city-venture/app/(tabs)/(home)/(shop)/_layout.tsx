import { ShopProvider } from "@/context/ShopContext";
import { Stack } from "expo-router";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

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
              animation: 'slide_from_right',
              headerTitleAlign: 'center',
              headerTitle: '',
              headerBackTitle: 'Back',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: '#F9FAFB' },
              headerRight: () => (
                <View
                  style={{ flexDirection: 'row', gap: 16, marginRight: 16 }}
                >
                  <TouchableOpacity>
                    <View>
                      <Ionicons
                        name="notifications-outline"
                        size={24}
                        color="black"
                      />
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 2,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#007AFF',
                          borderWidth: 1,
                          borderColor: '#F9FAFB',
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="cart-outline" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              ),
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
