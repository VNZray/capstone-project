import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/services/OrderService';
import {
  createPaymentIntent,
  attachEwalletPaymentMethod,
  open3DSAuthentication,
} from '@/services/PaymentIntentService';
import type { CreateOrderPayload } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import API_URL from '@/services/api';

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Pickup time constraints (must match backend validation in orderValidation.js)
const PICKUP_CONSTRAINTS = {
  MIN_MINUTES: 30, // Minimum 30 minutes from now (preparation time)
  MAX_HOURS: 72,   // Maximum 72 hours (3 days) for advance ordering
  DEFAULT_MINUTES: 60, // Default to 1 hour from now
};

const CheckoutScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors];
  const isDark = colorScheme === 'dark';
  const type = useTypography();

  const { items, businessId, clearCart, getSubtotal } = useCart();
  const { user } = useAuth();

  // Calculate pickup time boundaries
  const pickupBoundaries = useMemo(() => {
    const now = new Date();
    return {
      min: new Date(now.getTime() + PICKUP_CONSTRAINTS.MIN_MINUTES * 60 * 1000),
      max: new Date(now.getTime() + PICKUP_CONSTRAINTS.MAX_HOURS * 60 * 60 * 1000),
      default: new Date(now.getTime() + PICKUP_CONSTRAINTS.DEFAULT_MINUTES * 60 * 1000),
    };
  }, []);

  const [pickupDate, setPickupDate] = useState(pickupBoundaries.default);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<
    'cash_on_pickup' | 'paymongo'
  >('cash_on_pickup');
  const [paymentMethodType, setPaymentMethodType] = useState<
    'gcash' | 'card' | 'paymaya' | 'grab_pay'
  >('gcash');
  const [loading, setLoading] = useState(false);

  // Billing information for PayMongo payments
  const [billingName, setBillingName] = useState(user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : '');
  const [billingEmail, setBillingEmail] = useState(user?.email || '');
  const [billingPhone, setBillingPhone] = useState(user?.phone_number || '');

  const subtotal = getSubtotal();
  const taxAmount = 0; // Per spec.md - currently taxAmount=0
  const discountAmount = 0; // No discount for Phase 1
  const total = subtotal - discountAmount + taxAmount;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPickupDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setPickupDate(selectedDate);
    }
  };

  const togglePaymentMethod = (method: 'cash_on_pickup' | 'paymongo') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPaymentMethod(method);
  };

  /**
   * Process payment using Payment Intent workflow
   * Handles e-wallets (GCash, Maya, GrabPay) with redirect flow
   * For card payments, uses the card payment screen
   */
  const processPaymentIntentFlow = async (
    orderId: string,
    orderNumber: string,
    arrivalCode: string
  ): Promise<boolean> => {
    try {
      console.log('[Checkout] Starting Payment Intent flow...');

      // Step 1: Create Payment Intent via backend
      const intentResponse = await createPaymentIntent({
        order_id: orderId,
        payment_method_types: [paymentMethodType],
      });

      console.log('[Checkout] Payment Intent created:', intentResponse.data.payment_intent_id);

      const paymentIntentId = intentResponse.data.payment_intent_id;

      // For card payments, navigate to card payment screen
      if (paymentMethodType === 'card') {
        router.replace({
          pathname: '/(screens)/card-payment',
          params: {
            orderId,
            orderNumber,
            arrivalCode,
            paymentIntentId,
            clientKey: intentResponse.data.client_key,
            amount: intentResponse.data.amount.toString(),
            total: total.toString(),
          },
        } as never);
        return true;
      }

      // For e-wallets (GCash, Maya, GrabPay), attach payment method
      console.log('[Checkout] Attaching e-wallet payment method:', paymentMethodType);

      // Generate return URL for redirect after e-wallet authorization
      // PayMongo requires https:// URLs - use backend's redirect bridge endpoint
      // which will redirect back to the mobile app via deep links
      const backendBaseUrl = API_URL.replace('/api', '');
      const returnUrl = `${backendBaseUrl}/orders/${orderId}/payment-success`;
      console.log('[Checkout] Return URL for PayMongo:', returnUrl);

      // Billing info collected from the form
      const billing = {
        name: billingName.trim(),
        email: billingEmail.trim().toLowerCase(),
        phone: billingPhone.trim() || undefined,
      };

      const attachResponse = await attachEwalletPaymentMethod(
        paymentIntentId,
        paymentMethodType as 'gcash' | 'paymaya' | 'grab_pay',
        returnUrl,
        billing
      );

      console.log('[Checkout] Attachment response:', attachResponse.data.status);

      // Check if redirect is needed (for e-wallet authorization)
      if (attachResponse.data.redirect_url) {
        console.log('[Checkout] Opening e-wallet authorization:', attachResponse.data.redirect_url);

        // Open the e-wallet authorization URL
        await open3DSAuthentication(attachResponse.data.redirect_url);

        // After user returns from e-wallet, navigate to processing screen
        router.replace({
          pathname: '/(screens)/payment-processing',
          params: {
            orderId,
            orderNumber,
            arrivalCode,
            paymentIntentId,
            total: total.toString(),
          },
        } as never);
        return true;
      }

      // If no redirect needed (unlikely for e-wallets), payment may have succeeded
      if (attachResponse.data.status === 'succeeded') {
        router.replace({
          pathname: '/(screens)/order-confirmation',
          params: {
            orderId,
            orderNumber,
            arrivalCode,
            total: total.toString(),
            paymentMethod: paymentMethod,
            paymentSuccess: 'true',
          },
        } as never);
        return true;
      }

      return true;
    } catch (error: any) {
      console.error('[Checkout] Payment Intent flow failed:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to place an order');
      return;
    }

    if (!businessId) {
      Alert.alert('Error', 'No business selected');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart');
      return;
    }

    // Validate pickup datetime using same constraints as defined at top of file
    const now = new Date();
    const minPickupTime = new Date(now.getTime() + PICKUP_CONSTRAINTS.MIN_MINUTES * 60 * 1000);
    const maxPickupTime = new Date(now.getTime() + PICKUP_CONSTRAINTS.MAX_HOURS * 60 * 60 * 1000);

    if (pickupDate <= now) {
      Alert.alert('Invalid Time', 'Pickup time must be in the future');
      return;
    }

    if (pickupDate < minPickupTime) {
      Alert.alert(
        'Too Soon',
        `Pickup time must be at least ${PICKUP_CONSTRAINTS.MIN_MINUTES} minutes from now to allow preparation time.`
      );
      return;
    }

    if (pickupDate > maxPickupTime) {
      Alert.alert(
        'Too Far Ahead',
        `Pickup time cannot be more than ${PICKUP_CONSTRAINTS.MAX_HOURS / 24} days from now.`
      );
      return;
    }

    // Validate minimum amount for PayMongo Payment Intents (₱20.00)
    if (paymentMethod === 'paymongo' && total < 20) {
      Alert.alert(
        'Minimum Amount',
        'Online payment requires a minimum order of ₱20.00. Please add more items or choose Cash on Pickup.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate billing information for PayMongo payments
    if (paymentMethod === 'paymongo') {
      if (!billingName.trim()) {
        Alert.alert('Missing Information', 'Please enter your full name for billing.');
        return;
      }
      if (!billingEmail.trim()) {
        Alert.alert('Missing Information', 'Please enter your email address for billing.');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(billingEmail.trim())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
    }

    try {
      setLoading(true);

      const orderPayload: CreateOrderPayload = {
        business_id: businessId,
        user_id: user.id,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          special_requests: item.special_requests,
        })),
        discount_id: null,
        pickup_datetime: pickupDate.toISOString(),
        special_instructions: specialInstructions || undefined,
        payment_method: paymentMethod,
        payment_method_type:
          paymentMethod === 'paymongo' ? paymentMethodType : undefined,
        // Don't request checkout_url - we'll use Payment Intent flow
        skip_checkout_session: paymentMethod === 'paymongo',
      };

      console.log('[Checkout] Creating order:', orderPayload);

      const orderResponse = await createOrder(orderPayload);

      console.log('[Checkout] Order created:', orderResponse);

      clearCart();

      // For PayMongo payments, use Payment Intent workflow
      if (paymentMethod === 'paymongo') {
        try {
          await processPaymentIntentFlow(
            orderResponse.order_id,
            orderResponse.order_number,
            orderResponse.arrival_code
          );
          return;
        } catch (paymentError: any) {
          console.error('[Checkout] Payment Intent flow failed:', paymentError);
          
          // If Payment Intent fails, show error and navigate to order details
          Alert.alert(
            'Payment Error',
            'Failed to initialize payment. You can retry payment from your order details.',
            [
              {
                text: 'View Order',
                onPress: () => {
                  router.replace({
                    pathname: '/(screens)/order-confirmation',
                    params: {
                      orderId: orderResponse.order_id,
                      orderNumber: orderResponse.order_number,
                      arrivalCode: orderResponse.arrival_code,
                      total: total.toString(),
                      paymentMethod: paymentMethod,
                      paymentPending: 'true',
                    },
                  } as never);
                },
              },
            ]
          );
          return;
        }
      }

      // For Cash on Pickup, go directly to confirmation
      router.replace({
        pathname: '/(screens)/order-confirmation',
        params: {
          orderId: orderResponse.order_id,
          orderNumber: orderResponse.order_number,
          arrivalCode: orderResponse.arrival_code,
          total: total.toString(),
          paymentMethod: paymentMethod,
        },
      } as never);
    } catch (error: any) {
      console.error('[Checkout] Order creation failed:', error);

      let errorTitle = 'Order Failed';
      let errorMessage = 'Failed to create order. Please try again.';
      let showRetry = true;

      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        errorMessage = msg;

        if (
          msg.includes('out of stock') ||
          msg.includes('insufficient stock')
        ) {
          errorTitle = 'Stock Issue';
          errorMessage =
            msg +
            '\n\nSome items are out of stock. Please review your cart and try again.';
          showRetry = false;
        }

        if (msg.includes('unavailable') || msg.includes('not available')) {
          errorTitle = 'Product Unavailable';
          errorMessage =
            msg +
            '\n\nSome products are temporarily unavailable. Please remove them from your cart.';
          showRetry = false;
        }

        if (msg.includes('payment') && msg.includes('failed')) {
          errorTitle = 'Payment Error';
          errorMessage =
            'Payment processing failed. You can retry payment from the order details screen.';
        }

        if (error.code === 'ECONNABORTED' || msg.includes('timeout')) {
          errorTitle = 'Connection Timeout';
          errorMessage =
            'Request timed out. Please check your internet connection and try again.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage, [
        { text: 'OK', style: 'cancel' },
        ...(showRetry
          ? [
              {
                text: 'Retry',
                onPress: () => handlePlaceOrder(),
              },
            ]
          : []),
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Checkout',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <PageContainer padding={0}>
          <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                </View>
                <Text
                  style={[styles.stepLabel, { color: theme.textSecondary }]}
                >
                  Cart
                </Text>
              </View>
              <View
                style={[styles.stepLine, { backgroundColor: theme.primary }]}
              />
              <View style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: theme.accent,
                      borderColor: theme.accent,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      { color: theme.buttonPrimaryText },
                    ]}
                  >
                    2
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: theme.text, fontWeight: '600' },
                  ]}
                >
                  Checkout
                </Text>
              </View>
              <View
                style={[styles.stepLine, { backgroundColor: theme.border }]}
              />
              <View style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor: 'transparent',
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.stepNumber, { color: theme.textSecondary }]}
                  >
                    3
                  </Text>
                </View>
                <Text
                  style={[styles.stepLabel, { color: theme.textSecondary }]}
                >
                  Done
                </Text>
              </View>
            </View>

            {/* Order Summary */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, shadowColor: theme.shadow },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: theme.text, fontSize: type.h4 },
                  ]}
                >
                  Order Summary
                </Text>
                <Pressable onPress={() => router.back()}>
                  <Text style={[styles.editLink, { color: theme.active }]}>
                    Edit
                  </Text>
                </Pressable>
              </View>
              {items.slice(0, 3).map((item) => (
                <View key={item.product_id} style={styles.itemRow}>
                  <View
                    style={[
                      styles.quantityBadge,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    <Text style={[styles.quantityText, { color: theme.text }]}>
                      {item.quantity}x
                    </Text>
                  </View>
                  <Text
                    style={[styles.itemName, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {item.product_name}
                  </Text>
                  <Text style={[styles.itemPrice, { color: theme.text }]}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
              {items.length > 3 && (
                <Text
                  style={[styles.moreItems, { color: theme.textSecondary }]}
                >
                  +{items.length - 3} more items
                </Text>
              )}
            </View>

            {/* Pickup Details */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, shadowColor: theme.shadow },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.text, fontSize: type.h4, marginBottom: 16 },
                ]}
              >
                Pickup Details
              </Text>

              <View style={styles.dateTimeContainer}>
                <Pressable
                  style={[
                    styles.dateTimeButton,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={theme.accent}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.dateTimeLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Date
                    </Text>
                    <Text style={[styles.dateTimeValue, { color: theme.text }]}>
                      {pickupDate.toLocaleDateString()}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.dateTimeButton,
                    {
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={theme.accent}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.dateTimeLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Time
                    </Text>
                    <Text style={[styles.dateTimeValue, { color: theme.text }]}>
                      {pickupDate.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </Pressable>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={pickupDate}
                  mode="date"
                  display="default"
                  minimumDate={pickupBoundaries.min}
                  maximumDate={pickupBoundaries.max}
                  onChange={handleDateChange}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={pickupDate}
                  mode="time"
                  display="default"
                  minimumDate={pickupBoundaries.min}
                  onChange={handleTimeChange}
                />
              )}

              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Special Instructions (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="e.g., leave at counter, call upon arrival"
                placeholderTextColor={theme.textSecondary}
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Payment Method */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, shadowColor: theme.shadow },
              ]}
            >
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.text, fontSize: type.h4, marginBottom: 16 },
                ]}
              >
                Payment Method
              </Text>

              <Pressable
                style={[
                  styles.paymentOption,
                  {
                    borderColor:
                      paymentMethod === 'cash_on_pickup'
                        ? theme.accent
                        : theme.border,
                    backgroundColor:
                      paymentMethod === 'cash_on_pickup'
                        ? isDark
                          ? 'rgba(255, 183, 3, 0.1)'
                          : '#FFF9E6'
                        : theme.background,
                  },
                ]}
                onPress={() => togglePaymentMethod('cash_on_pickup')}
              >
                <View style={styles.paymentOptionHeader}>
                  <View
                    style={[
                      styles.paymentIcon,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <Ionicons
                      name="cash-outline"
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.paymentTextContainer}>
                    <Text style={[styles.paymentTitle, { color: theme.text }]}>
                      Cash on Pickup
                    </Text>
                    <Text
                      style={[
                        styles.paymentSubtitle,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Pay when you collect
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      paymentMethod === 'cash_on_pickup'
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={24}
                    color={
                      paymentMethod === 'cash_on_pickup'
                        ? theme.accent
                        : theme.textSecondary
                    }
                  />
                </View>
              </Pressable>

              <Pressable
                style={[
                  styles.paymentOption,
                  {
                    borderColor:
                      paymentMethod === 'paymongo'
                        ? theme.accent
                        : theme.border,
                    backgroundColor:
                      paymentMethod === 'paymongo'
                        ? isDark
                          ? 'rgba(255, 183, 3, 0.1)'
                          : '#FFF9E6'
                        : theme.background,
                  },
                ]}
                onPress={() => togglePaymentMethod('paymongo')}
              >
                <View style={styles.paymentOptionHeader}>
                  <View
                    style={[
                      styles.paymentIcon,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <Ionicons
                      name="card-outline"
                      size={24}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.paymentTextContainer}>
                    <Text style={[styles.paymentTitle, { color: theme.text }]}>
                      Online Payment
                    </Text>
                    <Text
                      style={[
                        styles.paymentSubtitle,
                        { color: theme.textSecondary },
                      ]}
                    >
                      GCash, Card, PayMaya
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      paymentMethod === 'paymongo'
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={24}
                    color={
                      paymentMethod === 'paymongo'
                        ? theme.accent
                        : theme.textSecondary
                    }
                  />
                </View>

                {paymentMethod === 'paymongo' && (
                  <View style={styles.subPaymentMethods}>
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.border, marginVertical: 12 },
                      ]}
                    />
                    <Text
                      style={[
                        styles.subPaymentLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Select Provider
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.providerScroll}
                    >
                      {['gcash', 'card', 'paymaya', 'grab_pay'].map((type) => (
                        <Pressable
                          key={type}
                          style={[
                            styles.providerChip,
                            {
                              backgroundColor:
                                paymentMethodType === type
                                  ? theme.primary
                                  : theme.background,
                              borderColor:
                                paymentMethodType === type
                                  ? theme.primary
                                  : theme.border,
                            },
                          ]}
                          onPress={() => setPaymentMethodType(type as any)}
                        >
                          <Text
                            style={[
                              styles.providerText,
                              {
                                color:
                                  paymentMethodType === type
                                    ? '#FFF'
                                    : theme.text,
                              },
                            ]}
                          >
                            {type === 'grab_pay'
                              ? 'GrabPay'
                              : type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </Pressable>

              {/* Billing Information - Only show for PayMongo */}
              {paymentMethod === 'paymongo' && (
                <View style={styles.billingSection}>
                  <View
                    style={[styles.divider, { backgroundColor: theme.border, marginVertical: 16 }]}
                  />
                  <Text
                    style={[
                      styles.cardTitle,
                      { color: theme.text, fontSize: type.h4, marginBottom: 12 },
                    ]}
                  >
                    Billing Information
                  </Text>
                  <Text
                    style={[styles.billingHint, { color: theme.textSecondary, marginBottom: 16 }]}
                  >
                    Required for online payment processing
                  </Text>

                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Full Name *
                  </Text>
                  <TextInput
                    style={[
                      styles.billingInput,
                      {
                        backgroundColor: theme.background,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    placeholder="Juan Dela Cruz"
                    placeholderTextColor={theme.textSecondary}
                    value={billingName}
                    onChangeText={setBillingName}
                    autoCapitalize="words"
                  />

                  <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>
                    Email Address *
                  </Text>
                  <TextInput
                    style={[
                      styles.billingInput,
                      {
                        backgroundColor: theme.background,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    placeholder="juan@email.com"
                    placeholderTextColor={theme.textSecondary}
                    value={billingEmail}
                    onChangeText={setBillingEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>
                    Phone Number (Optional)
                  </Text>
                  <TextInput
                    style={[
                      styles.billingInput,
                      {
                        backgroundColor: theme.background,
                        color: theme.text,
                        borderColor: theme.border,
                      },
                    ]}
                    placeholder="09XX XXX XXXX"
                    placeholderTextColor={theme.textSecondary}
                    value={billingPhone}
                    onChangeText={setBillingPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              )}

              {/* Security Badge */}
              <View style={styles.securityBadge}>
                <Ionicons name="lock-closed" size={14} color={theme.success} />
                <Text style={[styles.securityText, { color: theme.success }]}>
                  Secure 256-bit SSL Encryption
                </Text>
              </View>
            </View>

            {/* Total Section */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.surface,
                  shadowColor: theme.shadow,
                  marginBottom: 100,
                },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, { color: theme.textSecondary }]}
                >
                  Subtotal
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  ₱{subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, { color: theme.textSecondary }]}
                >
                  Tax
                </Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  ₱{taxAmount.toFixed(2)}
                </Text>
              </View>
              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>
                  Total
                </Text>
                <Text style={[styles.totalValue, { color: theme.accent }]}>
                  ₱{total.toFixed(2)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Bar */}
          <View
            style={[
              styles.bottomBar,
              { backgroundColor: theme.surface, borderTopColor: theme.border },
            ]}
          >
            <View style={styles.bottomBarTotal}>
              <Text
                style={[
                  styles.bottomTotalLabel,
                  { color: theme.textSecondary },
                ]}
              >
                Total Amount
              </Text>
              <Text style={[styles.bottomTotalValue, { color: theme.text }]}>
                ₱{total.toFixed(2)}
              </Text>
            </View>
            <Pressable
              style={[
                styles.placeOrderButton,
                {
                  backgroundColor: loading ? theme.disabled : theme.primary,
                  opacity: loading ? 0.8 : 1,
                },
              ]}
              onPress={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={[styles.placeOrderText, { color: '#FFF' }]}>
                    Place Order
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#FFF"
                    style={{ marginLeft: 8 }}
                  />
                </>
              )}
            </Pressable>
          </View>
        </PageContainer>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepWrapper: {
    alignItems: 'center',
    zIndex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    marginBottom: 20, // Align with center of circle
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '700',
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  quantityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreItems: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateTimeLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  paymentOption: {
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentTextContainer: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 12,
  },
  subPaymentMethods: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subPaymentLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  providerScroll: {
    gap: 8,
  },
  providerChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  providerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  bottomBarTotal: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: 12,
  },
  bottomTotalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 160,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: '700',
  },
  billingSection: {
    marginTop: 8,
  },
  billingHint: {
    fontSize: 12,
  },
  billingInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    height: 48,
  },
});

export default CheckoutScreen;
