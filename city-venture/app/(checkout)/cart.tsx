// See spec.md §4 - Tourist flow: Review cart → Proceed to checkout

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  Animated,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ShopColors, Brand, Slate } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import { useCart } from '@/context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';
import { Routes } from '@/routes/mainRoutes';

// Animated cart item component with swipe-to-delete gesture hint
interface CartItemCardProps {
  item: {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    special_requests?: string;
    stock: number;
    image_url?: string;
  };
  index: number;
  onQuantityChange: (
    productId: string,
    currentQty: number,
    delta: number
  ) => void;
  onRemove: (productId: string) => void;
  typography: ReturnType<typeof useTypography>;
}

function CartItemCard({
  item,
  index,
  onQuantityChange,
  onRemove,
  typography,
}: CartItemCardProps) {
  const { body, bodySmall, caption } = typography;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim, index]);

  const itemTotal = item.price * item.quantity;

  return (
    <Animated.View
      style={[
        styles.cartItemWrapper,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateY: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.cartItem}>
        {/* Product Image with elegant shadow */}
        <View style={styles.imageWrapper}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={[Slate[100], Slate[200]]}
              style={[styles.productImage, styles.placeholderImage]}
            >
              <Ionicons name="bag-outline" size={28} color={Slate[400]} />
            </LinearGradient>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <Text
              style={[styles.productName, { fontSize: body }]}
              numberOfLines={2}
            >
              {item.product_name}
            </Text>
            <Pressable
              hitSlop={12}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRemove(item.product_id);
              }}
              style={({ pressed }) => [
                styles.removeButton,
                pressed && styles.removeButtonPressed,
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={ShopColors.error}
              />
            </Pressable>
          </View>

          {item.special_requests && (
            <View style={styles.notesContainer}>
              <Ionicons
                name="document-text-outline"
                size={12}
                color={Brand.solarGold}
              />
              <Text
                style={[styles.notesText, { fontSize: caption }]}
                numberOfLines={1}
              >
                {item.special_requests}
              </Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.unitPrice, { fontSize: caption }]}>
                ₱{item.price.toFixed(2)} each
              </Text>
              <Text style={[styles.itemTotal, { fontSize: body }]}>
                ₱{itemTotal.toFixed(2)}
              </Text>
            </View>

            {/* Modern Quantity Stepper */}
            <View style={styles.quantityStepper}>
              <Pressable
                style={({ pressed }) => [
                  styles.stepperButton,
                  pressed && styles.stepperButtonPressed,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onQuantityChange(item.product_id, item.quantity, -1);
                }}
              >
                <Ionicons name="remove" size={16} color={Brand.deepNavy} />
              </Pressable>

              <View style={styles.quantityDisplay}>
                <Text style={[styles.quantityText, { fontSize: bodySmall }]}>
                  {item.quantity}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.stepperButton,
                  styles.stepperButtonAdd,
                  pressed && styles.stepperButtonPressed,
                  item.quantity >= item.stock && styles.stepperButtonDisabled,
                ]}
                onPress={() => {
                  if (item.quantity < item.stock) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onQuantityChange(item.product_id, item.quantity, 1);
                  }
                }}
                disabled={item.quantity >= item.stock}
              >
                <Ionicons
                  name="add"
                  size={16}
                  color={item.quantity >= item.stock ? Slate[300] : '#FFFFFF'}
                />
              </Pressable>
            </View>
          </View>

          {item.quantity >= item.stock && (
            <View style={styles.stockWarning}>
              <Ionicons name="alert-circle" size={12} color={Brand.solarGold} />
              <Text style={[styles.stockWarningText, { fontSize: caption }]}>
                Max stock reached
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const CartScreen = () => {
  const type = useTypography();
  const { h2, h3, h4, body, bodySmall, caption, micro } = type;
  const insets = useSafeAreaInsets();
  const { push, back, isNavigating } = usePreventDoubleNavigation();

  // Check if we came from payment-failed screen (need special back navigation)
  const params = useLocalSearchParams<{ fromPaymentFailed?: string }>();
  const fromPaymentFailed = params.fromPaymentFailed === 'true';

  const {
    items,
    businessName,
    isLoading,
    isValidating,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTotalItems,
    validateCart,
  } = useCart();

  // Track if we've validated on mount
  const [hasValidated, setHasValidated] = useState(false);

  // Validate cart when screen opens (sync with database)
  useEffect(() => {
    const runValidation = async () => {
      if (isLoading || hasValidated || items.length === 0) return;

      setHasValidated(true);
      const { removedCount, updatedCount } = await validateCart();

      // Notify user if items were removed or updated
      if (removedCount > 0) {
        Alert.alert(
          'Cart Updated',
          `${removedCount} item${
            removedCount > 1 ? 's were' : ' was'
          } removed from your cart because ${
            removedCount > 1 ? 'they are' : 'it is'
          } no longer available.`,
          [{ text: 'OK' }]
        );
      } else if (updatedCount > 0) {
        Alert.alert(
          'Cart Updated',
          `${updatedCount} item${
            updatedCount > 1 ? 's have' : ' has'
          } been updated with the latest prices and availability.`,
          [{ text: 'OK' }]
        );
      }
    };

    runValidation();
  }, [isLoading, hasValidated, items.length, validateCart]);

  // Handle back navigation
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (fromPaymentFailed) {
      // Coming from payment-failed - go to home to break checkout stack
      router.replace(Routes.tabs.home);
    } else {
      // Normal flow - use default back
      back();
    }
  };

  // Intercept Android back button - only override if from payment-failed
  useEffect(() => {
    if (!fromPaymentFailed) return; // Don't override normal flow

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        router.replace(Routes.tabs.home);
        return true; // Prevent default back behavior
      }
    );

    return () => backHandler.remove();
  }, [fromPaymentFailed]);

  const handleQuantityChange = (
    productId: string,
    currentQty: number,
    delta: number
  ) => {
    const newQuantity = currentQty + delta;
    if (newQuantity <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Remove Item',
        'Remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeFromCart(productId),
          },
        ],
        { cancelable: true }
      );
    } else {
      try {
        updateQuantity(productId, newQuantity);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred';
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const handleRemoveItem = (productId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Remove Item',
      'Remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(productId),
        },
      ],
      { cancelable: true }
    );
  };

  const handleClearCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Clear Cart',
      'Remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            clearCart();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert(
        'Empty Cart',
        'Please add items to your cart before checkout'
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    push(Routes.checkout.index());
  };

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `Shopping Cart (${totalItems})`,
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          headerTintColor: Brand.deepNavy,
          headerStyle: { backgroundColor: Slate[50] },
          // Custom back button - conditionally goes to home or uses normal back
          headerLeft: () => (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                {
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginLeft: 8,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name="arrow-back" size={24} color={Brand.deepNavy} />
            </Pressable>
          ),
          headerRight: () =>
            items.length > 0 ? (
              <Pressable
                onPress={handleClearCart}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.clearButtonPressed,
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={ShopColors.error}
                />
                <Text style={[styles.clearButtonText, { fontSize: caption }]}>
                  Clear
                </Text>
              </Pressable>
            ) : null,
        }}
      />

      <View style={styles.container}>
        {/* Background Gradient */}
        <LinearGradient
          colors={[Slate[50], '#FFFFFF', Slate[50]]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        {isLoading || isValidating ? (
          /* Loading State - Cart being restored from storage or validated */
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Brand.deepNavy} />
            <Text style={[styles.loadingText, { fontSize: body }]}>
              {isValidating
                ? 'Checking availability...'
                : 'Loading your cart...'}
            </Text>
          </View>
        ) : items.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIllustration}>
              <LinearGradient
                colors={[`${Brand.solarGold}15`, `${Brand.solarGold}05`]}
                style={styles.emptyIconOuter}
              >
                <View style={styles.emptyIconInner}>
                  <Ionicons
                    name="bag-outline"
                    size={48}
                    color={Brand.solarGold}
                  />
                </View>
              </LinearGradient>

              {/* Decorative elements */}
              <View style={[styles.floatingDot, styles.dot1]} />
              <View style={[styles.floatingDot, styles.dot2]} />
              <View style={[styles.floatingDot, styles.dot3]} />
            </View>

            <Text style={[styles.emptyTitle, { fontSize: h2 }]}>
              Your bag is empty
            </Text>
            <Text style={[styles.emptySubtitle, { fontSize: body }]}>
              Discover amazing products and add them to your cart
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.browseButton,
                pressed && styles.browseButtonPressed,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                back();
              }}
              disabled={isNavigating}
            >
              <LinearGradient
                colors={[Brand.deepNavy, '#1a2d5c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.browseButtonGradient}
              >
                <Ionicons name="compass-outline" size={20} color="#FFFFFF" />
                <Text style={[styles.browseButtonText, { fontSize: body }]}>
                  Explore Products
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <>
            {/* Cart Header */}

            {/* Cart Items List */}
            <Animated.ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: 260 + insets.bottom },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.storeCard}>
                {/* Store Header */}
                {businessName && (
                  <View style={styles.storeHeader}>
                    <Ionicons
                      name="storefront-outline"
                      size={20}
                      color={Brand.deepNavy}
                    />
                    <Text style={[styles.storeName, { fontSize: h4 }]}>
                      {businessName}
                    </Text>
                  </View>
                )}

                {items.map((item, index) => (
                  <React.Fragment key={item.product_id}>
                    <CartItemCard
                      item={item}
                      index={index}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                      typography={type}
                    />
                    {index < items.length - 1 && (
                      <View style={styles.itemDivider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </Animated.ScrollView>

            {/* Summary Footer with Glass Effect */}
            <View style={styles.footerContainer}>
              <View style={styles.footerBlur}>
                <View
                  style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}
                >
                  {/* Order Summary */}
                  <View style={styles.summarySection}>
                    <Text
                      style={[styles.summaryTitle, { fontSize: bodySmall }]}
                    >
                      Order Summary
                    </Text>

                    <View style={styles.summaryRow}>
                      <Text
                        style={[styles.summaryLabel, { fontSize: bodySmall }]}
                      >
                        Subtotal
                      </Text>
                      <Text
                        style={[styles.summaryValue, { fontSize: bodySmall }]}
                      >
                        ₱{subtotal.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text
                        style={[styles.summaryLabel, { fontSize: bodySmall }]}
                      >
                        Shipping
                      </Text>
                      <Text
                        style={[styles.shippingText, { fontSize: bodySmall }]}
                      >
                        Calculated at checkout
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                      <Text style={[styles.totalLabel, { fontSize: h4 }]}>
                        Total
                      </Text>
                      <Text style={[styles.totalValue, { fontSize: h3 }]}>
                        ₱{subtotal.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Checkout Button */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.checkoutButton,
                      pressed && styles.checkoutButtonPressed,
                    ]}
                    onPress={handleCheckout}
                  >
                    <LinearGradient
                      colors={[Brand.deepNavy, '#1a2d5c']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.checkoutGradient}
                    >
                      <Text style={[styles.checkoutText, { fontSize: body }]}>
                        Proceed to Checkout
                      </Text>
                      <View style={styles.checkoutArrow}>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#FFFFFF"
                        />
                      </View>
                    </LinearGradient>
                  </Pressable>

                  {/* Security Badge */}
                  <View style={styles.securityBadge}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={14}
                      color={Slate[400]}
                    />
                    <Text style={[styles.securityText, { fontSize: micro }]}>
                      Secure checkout powered by PayMongo
                    </Text>
                  </View>
                </View>
              </View>
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
    backgroundColor: Slate[50],
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: Slate[500],
    fontWeight: '500',
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: `${ShopColors.error}10`,
    marginRight: 8,
    gap: 4,
  },
  clearButtonPressed: {
    opacity: 0.7,
  },
  clearButtonText: {
    color: ShopColors.error,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIllustration: {
    position: 'relative',
    marginBottom: 32,
  },
  emptyIconOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Brand.solarGold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  floatingDot: {
    position: 'absolute',
    borderRadius: 10,
    backgroundColor: Brand.solarGold,
  },
  dot1: {
    width: 12,
    height: 12,
    top: 10,
    right: 10,
    opacity: 0.6,
  },
  dot2: {
    width: 8,
    height: 8,
    bottom: 20,
    left: 5,
    opacity: 0.4,
  },
  dot3: {
    width: 6,
    height: 6,
    top: 40,
    left: -5,
    opacity: 0.3,
  },
  emptyTitle: {
    color: Brand.deepNavy,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    color: Slate[500],
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  browseButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Brand.deepNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  browseButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  browseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Cart Header

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
    gap: 16,
  },

  // Cart Item Card
  // Cart Item Card
  cartItemWrapper: {
    // Removed card styling as it's now on the container
  },
  cartItem: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  imageWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  productName: {
    flex: 1,
    color: Brand.deepNavy,
    fontWeight: '600',
    lineHeight: 22,
  },
  removeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: `${ShopColors.error}08`,
  },
  removeButtonPressed: {
    backgroundColor: `${ShopColors.error}15`,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${Brand.solarGold}10`,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  notesText: {
    color: Slate[500],
    fontStyle: 'italic',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  unitPrice: {
    color: Slate[400],
    marginBottom: 2,
  },
  itemTotal: {
    color: Brand.deepNavy,
    fontWeight: '700',
  },
  quantityStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Slate[50],
    borderRadius: 12,
    elevation: 1,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperButtonAdd: {
    backgroundColor: Brand.deepNavy,
  },
  stepperButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  stepperButtonDisabled: {
    backgroundColor: Slate[200],
  },
  quantityDisplay: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: Brand.deepNavy,
    fontWeight: '700',
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  stockWarningText: {
    color: Brand.solarGold,
    fontWeight: '500',
  },

  // Promo Section

  // Footer
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerBlur: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderColor: Slate[100],
    backgroundColor: ShopColors.background,
    shadowColor: Brand.deepNavy,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  footer: {
    padding: 16,
    backgroundColor: ShopColors.background,
  },
  summarySection: {
    marginBottom: 12,
  },
  summaryTitle: {
    color: Slate[500],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryLabel: {
    color: Slate[500],
  },
  summaryValue: {
    color: Brand.deepNavy,
    fontWeight: '500',
  },
  shippingText: {
    color: Slate[400],
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: Slate[200],
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: Brand.deepNavy,
    fontWeight: '600',
  },
  totalValue: {
    color: Brand.deepNavy,
    fontWeight: '700',
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Brand.deepNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  checkoutButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  checkoutArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  securityText: {
    color: Slate[400],
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Slate[100],
  },
  storeName: {
    color: Brand.deepNavy,
    fontWeight: '700',
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: Brand.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  itemDivider: {
    height: 1,
    backgroundColor: Slate[100],
    marginHorizontal: 16,
  },
});

export default CartScreen;
