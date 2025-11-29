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
import { ShopColors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import { useCart } from '@/context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const CartScreen = () => {
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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Shopping Cart',
          headerStyle: { backgroundColor: ShopColors.surface },
          headerTintColor: ShopColors.textPrimary,
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
                    { color: ShopColors.error },
                  ]}
                >
                  Clear All
                </Text>
              </Pressable>
            ) : null,
        }}
      />

      {/* Main Background */}
      <View
        style={[styles.container, { backgroundColor: ShopColors.background }]}
      >
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="cart-outline"
                size={64}
                color={ShopColors.textSecondary}
              />
            </View>
            <Text
              style={[
                { fontSize: h3, fontWeight: 'bold' },
                {
                  color: ShopColors.textPrimary,
                  marginTop: 24,
                  textAlign: 'center',
                },
              ]}
            >
              Your Cart is Empty
            </Text>
            <Text
              style={[
                { fontSize: body },
                {
                  color: ShopColors.textSecondary,
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
              <View style={styles.browseButton}>
                <Text
                  style={[
                    { fontSize: body, fontWeight: 'bold' },
                    { color: '#FFFFFF' },
                  ]}
                >
                  Start Shopping
                </Text>
              </View>
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
                      backgroundColor: ShopColors.surface,
                      borderColor: ShopColors.border,
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
                            { backgroundColor: ShopColors.inputBackground },
                          ]}
                        >
                          <Ionicons
                            name="image-outline"
                            size={32}
                            color={ShopColors.textSecondary}
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
                            { color: ShopColors.textPrimary, flex: 1 },
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
                            name="close"
                            size={20}
                            color={ShopColors.textSecondary}
                          />
                        </Pressable>
                      </View>

                      {item.special_requests && (
                        <Text
                          style={[
                            { fontSize: caption },
                            { color: ShopColors.textSecondary, marginTop: 4 },
                          ]}
                          numberOfLines={1}
                        >
                          {item.special_requests}
                        </Text>
                      )}

                      <View style={styles.priceQuantityRow}>
                        <Text
                          style={[
                            { fontSize: body, fontWeight: '600' },
                            { color: ShopColors.textPrimary },
                          ]}
                        >
                          ₱{item.price.toFixed(2)}
                        </Text>

                        {/* Quantity Controls */}
                        <View
                          style={[
                            styles.quantityControl,
                            { borderColor: ShopColors.border },
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
                              color={ShopColors.textPrimary}
                            />
                          </Pressable>

                          <Text
                            style={[
                              { fontSize: bodySmall, fontWeight: '600' },
                              {
                                color: ShopColors.textPrimary,
                                minWidth: 24,
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
                                  ? ShopColors.textSecondary
                                  : ShopColors.textPrimary
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
                  backgroundColor: ShopColors.surface,
                  borderTopColor: ShopColors.border,
                },
              ]}
            >
              <View style={styles.summaryDetails}>
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      { fontSize: body },
                      { color: ShopColors.textSecondary },
                    ]}
                  >
                    Subtotal ({totalItems} items)
                  </Text>
                  <Text
                    style={[
                      { fontSize: body, fontWeight: '600' },
                      { color: ShopColors.textPrimary },
                    ]}
                  >
                    ₱{subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, { marginTop: 12 }]}>
                  <Text
                    style={[
                      { fontSize: h4, fontWeight: 'bold' },
                      { color: ShopColors.textPrimary },
                    ]}
                  >
                    Total
                  </Text>
                  <Text
                    style={[
                      { fontSize: h4, fontWeight: 'bold' },
                      { color: ShopColors.textPrimary },
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
                <View style={styles.checkoutButton}>
                  <Text
                    style={[
                      { fontSize: body, fontWeight: 'bold' },
                      { color: '#FFFFFF' },
                    ]}
                  >
                    Proceed to Checkout
                  </Text>
                </View>
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ShopColors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  browseButtonWrapper: {
    marginTop: 32,
    borderRadius: 8,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 200,
  },
  browseButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ShopColors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  cartItem: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
  },
  itemMainRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: ShopColors.inputBackground,
    borderWidth: 1,
    borderColor: ShopColors.border,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
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
    borderRadius: 4,
    borderWidth: 1,
    height: 32,
  },
  qtyBtn: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  checkoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ShopColors.primary,
  },
});

export default CartScreen;
