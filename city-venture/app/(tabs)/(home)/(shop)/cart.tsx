// See spec.md §4 - Tourist flow: Review cart → Proceed to checkout

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useTypography } from '@/constants/typography';
import { useCart } from '@/context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const CartScreen = () => {
  const { colors, isDark } = useTheme();
  const type = useTypography();
  const { h3, h4, body, bodySmall, caption } = type;
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTotalItems,
  } = useCart();

  const palette = {
    bg: colors.background,
    card: colors.surface,
    text: colors.text,
    subText: colors.textSecondary,
    border: colors.border,
    accent: colors.accent,
    primary: colors.primary,
  };

  const handleQuantityChange = (
    productId: string,
    currentQty: number,
    delta: number
  ) => {
    const newQuantity = currentQty + delta;
    if (newQuantity <= 0) {
      Alert.alert('Remove Item', 'Remove this item from cart?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(productId),
        },
      ]);
    } else {
      try {
        updateQuantity(productId, newQuantity);
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleRemoveItem = (productId: string) => {
    Alert.alert('Remove Item', 'Remove this item from cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Please add items to your cart before checkout'
      );
      return;
    }
    router.push('/(screens)/checkout' as never);
  };

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  // Midnight Sunlight Gradients
  const buttonGradient = ['#FFD700', '#FF8C00'] as const; // Gold to Dark Orange
  const buttonText = '#0A1B47'; // Dark text on warm button

  const emptyStateGradient = isDark
    ? (['#1A2B57', '#0A1B47'] as const)
    : (['#FFF5E1', '#FFFFFF'] as const);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Shopping Cart',
          headerStyle: { backgroundColor: palette.bg },
          headerTintColor: palette.text,
          headerShadowVisible: false,
          headerRight: () =>
            items.length > 0 ? (
              <Pressable
                onPress={handleClearCart}
                style={({ pressed }) => ({
                  marginRight: 16,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={[
                    { fontSize: bodySmall, fontWeight: '600' },
                    { color: colors.error },
                  ]}
                >
                  Clear All
                </Text>
              </Pressable>
            ) : null,
        }}
      />

      {/* Main Background */}
      <View style={[styles.container, { backgroundColor: palette.bg }]}>
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={emptyStateGradient}
              style={styles.emptyIconContainer}
            >
              <Ionicons
                name="cart-outline"
                size={64}
                color={isDark ? '#FFD700' : '#FF8C00'}
              />
            </LinearGradient>
            <Text
              style={[
                { fontSize: h3, fontWeight: 'bold' },
                { color: palette.text, marginTop: 24, textAlign: 'center' },
              ]}
            >
              Your Cart is Empty
            </Text>
            <Text
              style={[
                { fontSize: body },
                {
                  color: palette.subText,
                  marginTop: 12,
                  textAlign: 'center',
                  maxWidth: '80%',
                },
              ]}
            >
              Looks like you haven&apos;t added anything to your cart yet.
            </Text>
            <Pressable
              style={styles.browseButtonWrapper}
              onPress={() => router.back()}
            >
              <LinearGradient
                colors={buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.browseButton}
              >
                <Text
                  style={[
                    { fontSize: body, fontWeight: 'bold' },
                    { color: buttonText },
                  ]}
                >
                  Start Shopping
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Cart Items */}
              {items.map((item) => (
                <View
                  key={item.product_id}
                  style={[
                    styles.cartItem,
                    {
                      backgroundColor: palette.card,
                      shadowColor: isDark ? '#000' : '#ccc',
                      borderColor: isDark
                        ? 'rgba(255,215,0,0.1)'
                        : 'transparent', // Subtle gold border in dark mode
                      borderWidth: isDark ? 1 : 0,
                    },
                  ]}
                >
                  <View style={styles.itemMainRow}>
                    {/* Product Image */}
                    <View style={styles.imageContainer}>
                      {item.image_url ? (
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.productImage,
                            styles.placeholderImage,
                            { backgroundColor: isDark ? '#1A2B57' : '#F0F0F0' },
                          ]}
                        >
                          <Ionicons
                            name="image-outline"
                            size={32}
                            color={palette.subText}
                          />
                        </View>
                      )}
                    </View>

                    {/* Product Info */}
                    <View style={styles.productInfo}>
                      <View style={styles.titleRow}>
                        <Text
                          style={[
                            { fontSize: body, fontWeight: '600' },
                            { color: palette.text, flex: 1 },
                          ]}
                          numberOfLines={2}
                        >
                          {item.product_name}
                        </Text>
                        <Pressable
                          hitSlop={10}
                          onPress={() => handleRemoveItem(item.product_id)}
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={22}
                            color={palette.subText}
                          />
                        </Pressable>
                      </View>

                      {item.special_requests && (
                        <Text
                          style={[
                            { fontSize: caption },
                            { color: palette.subText, marginTop: 4 },
                          ]}
                          numberOfLines={1}
                        >
                          {item.special_requests}
                        </Text>
                      )}

                      <View style={styles.priceQuantityRow}>
                        <Text
                          style={[
                            { fontSize: body, fontWeight: '700' },
                            { color: isDark ? '#FFD700' : colors.primary }, // Gold in dark, Primary in light
                          ]}
                        >
                          ₱{item.price.toFixed(2)}
                        </Text>

                        {/* Quantity Controls */}
                        <View
                          style={[
                            styles.quantityControl,
                            { backgroundColor: isDark ? '#0A1B47' : '#F5F5F5' },
                          ]}
                        >
                          <Pressable
                            style={styles.qtyBtn}
                            onPress={() =>
                              handleQuantityChange(
                                item.product_id,
                                item.quantity,
                                -1
                              )
                            }
                          >
                            <Ionicons
                              name="remove"
                              size={16}
                              color={palette.text}
                            />
                          </Pressable>

                          <Text
                            style={[
                              { fontSize: bodySmall, fontWeight: '600' },
                              {
                                color: palette.text,
                                minWidth: 20,
                                textAlign: 'center',
                              },
                            ]}
                          >
                            {item.quantity}
                          </Text>

                          <Pressable
                            style={styles.qtyBtn}
                            onPress={() =>
                              handleQuantityChange(
                                item.product_id,
                                item.quantity,
                                1
                              )
                            }
                            disabled={item.quantity >= item.stock}
                          >
                            <Ionicons
                              name="add"
                              size={16}
                              color={
                                item.quantity >= item.stock
                                  ? palette.subText
                                  : palette.text
                              }
                            />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Summary Footer */}
            <View
              style={[
                styles.footer,
                {
                  backgroundColor: palette.card,
                  borderTopColor: isDark ? '#1A2B57' : '#F0F0F0',
                  shadowColor: '#000',
                },
              ]}
            >
              <View style={styles.summaryDetails}>
                <View style={styles.summaryRow}>
                  <Text
                    style={[{ fontSize: body }, { color: palette.subText }]}
                  >
                    Subtotal ({totalItems} items)
                  </Text>
                  <Text
                    style={[
                      { fontSize: body, fontWeight: '600' },
                      { color: palette.text },
                    ]}
                  >
                    ₱{subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, { marginTop: 8 }]}>
                  <Text
                    style={[
                      { fontSize: h4, fontWeight: 'bold' },
                      { color: palette.text },
                    ]}
                  >
                    Total
                  </Text>
                  <Text
                    style={[
                      { fontSize: h4, fontWeight: 'bold' },
                      { color: isDark ? '#FFD700' : colors.primary },
                    ]}
                  >
                    ₱{subtotal.toFixed(2)}
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.checkoutButtonWrapper}
                onPress={handleCheckout}
              >
                <LinearGradient
                  colors={buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.checkoutButton}
                >
                  <Text
                    style={[
                      { fontSize: body, fontWeight: 'bold' },
                      { color: buttonText },
                    ]}
                  >
                    Proceed to Checkout
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={buttonText}
                    style={{ marginLeft: 8 }}
                  />
                </LinearGradient>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  browseButtonWrapper: {
    marginTop: 32,
    borderRadius: 25,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 250,
  },
  browseButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cartItem: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemMainRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  summaryDetails: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutButton: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CartScreen;
