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
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { useCart } from '@/context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const CartScreen = () => {
  const { colors, isDark } = useTheme();
  const type = useTypography();
  const { h4, body, bodySmall } = type;
  const { items, removeFromCart, updateQuantity, clearCart, getSubtotal, getTotalItems } = useCart();

  const palette = {
    bg: colors.background,
    card: colors.surface,
    text: colors.text,
    subText: colors.textSecondary,
    border: colors.border,
  };

  const handleQuantityChange = (productId: string, currentQty: number, delta: number) => {
    const newQuantity = currentQty + delta;
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'Remove this item from cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(productId) },
        ]
      );
    } else {
      try {
        updateQuantity(productId, newQuantity);
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
  };

  const handleRemoveItem = (productId: string) => {
    Alert.alert(
      'Remove Item',
      'Remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(productId) },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }
    router.push('/(screens)/checkout' as never);
  };

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Shopping Cart',
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
          headerRight: () =>
            items.length > 0 ? (
              <Pressable onPress={handleClearCart} style={{ marginRight: 16 }}>
                <Text style={[{ fontSize: body }, { color: palette.text }]}>Clear</Text>
              </Pressable>
            ) : null,
        }}
      />
      <PageContainer>
        <View style={[styles.container, { backgroundColor: palette.bg }]}>
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={80} color={palette.subText} />
              <Text style={[{ fontSize: h4 }, { color: palette.text, marginTop: 16 }]}>
                Your cart is empty
              </Text>
              <Text style={[{ fontSize: body }, { color: palette.subText, marginTop: 8 }]}>
                Add some products to get started
              </Text>
              <Pressable
                style={[styles.browseButton, { backgroundColor: colors.buttonPrimaryBg }]}
                onPress={() => router.back()}
              >
                <Text style={[{ fontSize: body }, { color: colors.buttonPrimaryText }]}>
                  Browse Products
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {/* Cart Items */}
                {items.map((item) => (
                  <View
                    key={item.product_id}
                    style={[styles.cartItem, { backgroundColor: palette.card, borderColor: palette.border }]}
                  >
                    {/* Product Image */}
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.productImage, styles.placeholderImage, { backgroundColor: palette.border }]}>
                        <Ionicons name="image-outline" size={32} color={palette.subText} />
                      </View>
                    )}

                    {/* Product Info */}
                    <View style={styles.productInfo}>
                      <Text style={[{ fontSize: h4 }, { color: palette.text }]} numberOfLines={2}>
                        {item.product_name}
                      </Text>
                      <Text style={[{ fontSize: body }, { color: colors.accent, marginTop: 4 }]}>
                        ₱{item.price.toFixed(2)}
                      </Text>
                      {item.special_requests && (
                        <Text style={[{ fontSize: bodySmall }, { color: palette.subText, marginTop: 4 }]} numberOfLines={2}>
                          Note: {item.special_requests}
                        </Text>
                      )}

                      {/* Quantity Controls */}
                      <View style={styles.quantityRow}>
                        <Pressable
                          style={[styles.quantityButton, { backgroundColor: palette.border }]}
                          onPress={() => handleQuantityChange(item.product_id, item.quantity, -1)}
                        >
                          <Ionicons name="remove" size={16} color={palette.text} />
                        </Pressable>
                        
                        <Text style={[{ fontSize: body }, { color: palette.text, marginHorizontal: 16 }]}>
                          {item.quantity}
                        </Text>
                        
                        <Pressable
                          style={[styles.quantityButton, { backgroundColor: palette.border }]}
                          onPress={() => handleQuantityChange(item.product_id, item.quantity, 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Ionicons name="add" size={16} color={palette.text} />
                        </Pressable>

                        <Text style={[{ fontSize: body }, { color: palette.text, marginLeft: 'auto' }]}>
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Remove Button */}
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.product_id)}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>

              {/* Summary Footer */}
              <View style={[styles.footer, { backgroundColor: palette.card, borderTopColor: palette.border }]}>
                <View style={styles.summaryRow}>
                  <Text style={[{ fontSize: body }, { color: palette.subText }]}>
                    Items ({totalItems})
                  </Text>
                  <Text style={[{ fontSize: body }, { color: palette.subText }]}>
                    ₱{subtotal.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[{ fontSize: h4 }, { color: palette.text }]}>
                    Subtotal
                  </Text>
                  <Text style={[{ fontSize: h4 }, { color: colors.accent }]}>
                    ₱{subtotal.toFixed(2)}
                  </Text>
                </View>

                <Pressable
                  style={[styles.checkoutButton, { backgroundColor: colors.buttonPrimaryBg }]}
                  onPress={handleCheckout}
                >
                  <Text style={[{ fontSize: body }, { color: colors.buttonPrimaryText }]}>
                    Proceed to Checkout
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </PageContainer>
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
  browseButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  checkoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
});

export default CartScreen;
