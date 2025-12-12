import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/services/OrderService';
import * as WebBrowser from 'expo-web-browser';
import type { CreateOrderPayload } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';
// Custom date/time picker UI replaces native DateTimePicker
import { usePreventDoubleNavigation } from '@/hooks/usePreventDoubleNavigation';
import { Routes } from '@/routes/mainRoutes';
import { useHideTabs } from '@/hooks/useHideTabs';
import {
  validateCardNumber,
  formatCardNumber,
  getCardBrand,
} from '@/services/PaymentIntentService';

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
  MAX_HOURS: 72, // Maximum 72 hours (3 days) for advance ordering
  DEFAULT_MINUTES: 60, // Default to 1 hour from now
};

const CheckoutScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors];
  const isDark = colorScheme === 'dark';
  const type = useTypography();
  const { push, replace, back, isNavigating } = usePreventDoubleNavigation();

  // Get prefill params from navigation (used when changing payment method from failed screen)
  const prefillParams = useLocalSearchParams<{
    prefillOrderId?: string;
    prefillPaymentMethod?: string;
    prefillBillingName?: string;
    prefillBillingEmail?: string;
    prefillBillingPhone?: string;
    prefillPickupDatetime?: string;
    prefillSpecialInstructions?: string;
    fromChangePaymentMethod?: string;
  }>();

  const isFromChangePaymentMethod = prefillParams.fromChangePaymentMethod === 'true';

  // Hide tabs during checkout flow
  useHideTabs();

  const { items, businessId, clearCart, getSubtotal } = useCart();
  const { user } = useAuth();

  // Calculate pickup time boundaries
  const pickupBoundaries = useMemo(() => {
    const now = new Date();
    return {
      min: new Date(now.getTime() + PICKUP_CONSTRAINTS.MIN_MINUTES * 60 * 1000),
      max: new Date(
        now.getTime() + PICKUP_CONSTRAINTS.MAX_HOURS * 60 * 60 * 1000
      ),
      default: new Date(
        now.getTime() + PICKUP_CONSTRAINTS.DEFAULT_MINUTES * 60 * 1000
      ),
    };
  }, []);

  const [pickupDate, setPickupDate] = useState(pickupBoundaries.default);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Generate available dates (today + next 2 days)
  const availableDates = useMemo(() => {
    const dates: { label: string; value: Date }[] = [];
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const label =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
      dates.push({ label, value: date });
    }
    return dates;
  }, []);

  // Generate available time slots (30-min increments)
  const availableTimeSlots = useMemo(() => {
    const slots: { label: string; hour: number; minute: number }[] = [];
    const now = new Date();
    const selectedDateStr = pickupDate.toDateString();
    const todayStr = now.toDateString();
    const isToday = selectedDateStr === todayStr;

    // Start from minimum pickup time if today, otherwise from store opening
    let startHour = isToday ? now.getHours() : 8;
    let startMinute = isToday ? (now.getMinutes() < 30 ? 30 : 0) : 0;
    if (isToday && now.getMinutes() >= 30) startHour += 1;
    // Add minimum 30 min buffer for preparation
    if (isToday) {
      startMinute += 30;
      if (startMinute >= 60) {
        startMinute -= 60;
        startHour += 1;
      }
    }

    for (let hour = startHour; hour <= 22; hour++) {
      for (let minute of [0, 30]) {
        if (hour === startHour && minute < startMinute) continue;
        if (hour === 22 && minute > 0) continue;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const label = `${displayHour}:${minute
          .toString()
          .padStart(2, '0')} ${period}`;
        slots.push({ label, hour, minute });
      }
    }
    return slots;
  }, [pickupDate]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  // Payment selection: 'cash_on_pickup' or PayMongo type ('gcash', 'paymaya', 'card')
  const [paymentMethod, setPaymentMethod] = useState<
    'cash_on_pickup' | 'gcash' | 'paymaya' | 'card'
  >('cash_on_pickup');

  // Derived: is this an online payment?
  const isOnlinePayment = ['gcash', 'paymaya', 'card'].includes(paymentMethod);

  const [loading, setLoading] = useState(false);

  // Billing information for PayMongo payments
  const [billingName, setBillingName] = useState(
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : ''
  );
  const [billingEmail, setBillingEmail] = useState(user?.email || '');
  const [billingPhone, setBillingPhone] = useState(user?.phone_number || '');

  // Card payment form state (inline card entry)
  const [cardNumber, setCardNumber] = useState('5234000000000106');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('25');
  const [cvc, setCvc] = useState('123');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  // Input refs for auto-focus between card fields
  const expMonthRef = useRef<TextInput>(null);
  const expYearRef = useRef<TextInput>(null);
  const cvcRef = useRef<TextInput>(null);

  // Get card brand for icon display
  const cardBrand = getCardBrand(cardNumber);

  // Format card number as user types
  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    if (cardErrors.cardNumber) {
      setCardErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
    // Auto-focus to expiry when card number is complete (16 digits + 3 spaces)
    if (formatted.replace(/\s/g, '').length === 16) {
      expMonthRef.current?.focus();
    }
  };

  // Handle expiry month input
  const handleExpMonthChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) {
      setExpMonth(digits);
      if (cardErrors.expMonth) {
        setCardErrors((prev) => ({ ...prev, expMonth: '' }));
      }
      // Auto-focus to year when month is complete
      if (digits.length === 2) {
        expYearRef.current?.focus();
      }
    }
  };

  // Handle expiry year input
  const handleExpYearChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) {
      setExpYear(digits);
      if (cardErrors.expYear) {
        setCardErrors((prev) => ({ ...prev, expYear: '' }));
      }
      // Auto-focus to CVC when year is complete
      if (digits.length === 2) {
        cvcRef.current?.focus();
      }
    }
  };

  // Handle CVC input
  const handleCvcChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 4) {
      setCvc(digits);
      if (cardErrors.cvc) {
        setCardErrors((prev) => ({ ...prev, cvc: '' }));
      }
    }
  };

  // Validate card form
  const validateCardForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number validation
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(cleanCardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Expiry validation
    const month = parseInt(expMonth, 10);
    if (!expMonth) {
      newErrors.expMonth = 'Required';
    } else if (month < 1 || month > 12) {
      newErrors.expMonth = 'Invalid';
    }

    const year = parseInt(expYear, 10);
    const currentYear = new Date().getFullYear() % 100;
    if (!expYear) {
      newErrors.expYear = 'Required';
    } else if (year < currentYear) {
      newErrors.expYear = 'Expired';
    }

    // Check if card is expired
    if (expMonth && expYear && !newErrors.expMonth && !newErrors.expYear) {
      const now = new Date();
      const expDate = new Date(2000 + year, month, 0);
      if (expDate < now) {
        newErrors.expMonth = 'Card expired';
      }
    }

    // CVC validation
    if (!cvc) {
      newErrors.cvc = 'Required';
    } else if (cvc.length < 3) {
      newErrors.cvc = 'Invalid';
    }

    setCardErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Warm up browser for faster payment flow (Android optimization)
  useEffect(() => {
    if (Platform.OS === 'android') {
      WebBrowser.warmUpAsync();
      return () => {
        WebBrowser.coolDownAsync();
      };
    }
  }, []);

  // Prefill form values when coming from change payment method flow
  useEffect(() => {
    if (isFromChangePaymentMethod) {
      console.log('[Checkout] Prefilling from change payment method:', prefillParams);
      
      // Prefill billing info
      if (prefillParams.prefillBillingName) {
        setBillingName(prefillParams.prefillBillingName);
      }
      if (prefillParams.prefillBillingEmail) {
        setBillingEmail(prefillParams.prefillBillingEmail);
      }
      if (prefillParams.prefillBillingPhone) {
        setBillingPhone(prefillParams.prefillBillingPhone);
      }
      
      // Prefill special instructions
      if (prefillParams.prefillSpecialInstructions) {
        setSpecialInstructions(prefillParams.prefillSpecialInstructions);
      }
      
      // Prefill pickup datetime if valid
      if (prefillParams.prefillPickupDatetime) {
        const prefillDate = new Date(prefillParams.prefillPickupDatetime);
        const now = new Date();
        // Only use prefilled date if it's still in the future
        if (prefillDate > now) {
          setPickupDate(prefillDate);
        }
      }
      
      // Don't prefill payment method - user is changing it
      // Payment method stays at default 'cash_on_pickup' so user can choose new one
    }
  }, [isFromChangePaymentMethod]); // Only run once on mount

  const subtotal = getSubtotal();
  const taxAmount = 0; // Per spec.md - currently taxAmount=0
  const discountAmount = 0; // No discount for Phase 1
  const total = subtotal - discountAmount + taxAmount;

  const handleDateSelect = (date: Date) => {
    console.log('[Checkout] handleDateSelect called with:', date);
    const newDate = new Date(pickupDate);
    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    console.log(
      '[Checkout] Setting pickupDate to:',
      newDate,
      newDate.toISOString()
    );
    setPickupDate(newDate);
    setShowDatePicker(false);
  };

  const handleTimeSelect = (hour: number, minute: number) => {
    console.log(
      '[Checkout] handleTimeSelect called with hour:',
      hour,
      'minute:',
      minute
    );
    const newDate = new Date(pickupDate);
    newDate.setHours(hour, minute, 0, 0);
    console.log(
      '[Checkout] Setting pickupDate to:',
      newDate,
      newDate.toISOString()
    );
    setPickupDate(newDate);
    setShowTimePicker(false);
  };

  const togglePaymentMethod = (
    method: 'cash_on_pickup' | 'gcash' | 'paymaya' | 'card'
  ) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPaymentMethod(method);
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
    const minPickupTime = new Date(
      now.getTime() + PICKUP_CONSTRAINTS.MIN_MINUTES * 60 * 1000
    );
    const maxPickupTime = new Date(
      now.getTime() + PICKUP_CONSTRAINTS.MAX_HOURS * 60 * 60 * 1000
    );

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
        `Pickup time cannot be more than ${
          PICKUP_CONSTRAINTS.MAX_HOURS / 24
        } days from now.`
      );
      return;
    }

    // Validate minimum amount for PayMongo Payment Intents (₱20.00)
    if (isOnlinePayment && total < 20) {
      Alert.alert(
        'Minimum Amount',
        'Online payment requires a minimum order of ₱20.00. Please add more items or choose Cash on Pickup.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate billing information for PayMongo payments
    if (isOnlinePayment) {
      if (paymentMethod === 'card') {
        // For card payments, validate card form
        if (!validateCardForm()) {
          Alert.alert(
            'Card Error',
            'Please check your card details and try again.'
          );
          return;
        }
        // Card payments use card form fields for billing
        if (!billingName.trim()) {
          Alert.alert(
            'Missing Information',
            'Please enter your full name for billing.'
          );
          return;
        }
        if (!billingEmail.trim()) {
          Alert.alert(
            'Missing Information',
            'Please enter your email address for billing.'
          );
          return;
        }
      } else {
        // For e-wallets (GCash, Maya), use billing section fields
        if (!billingName.trim()) {
          Alert.alert(
            'Missing Information',
            'Please enter your full name for billing.'
          );
          return;
        }
        if (!billingEmail.trim()) {
          Alert.alert(
            'Missing Information',
            'Please enter your email address for billing.'
          );
          return;
        }
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(billingEmail.trim())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
    }

    // Build the order payload
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
    };

    // Check if using PayMongo (any online payment method)
    const isPayMongoPayment = ['gcash', 'paymaya', 'card'].includes(
      paymentMethod
    );

    // ========== FoodPanda/GrabFood Style Flow ==========
    // For PayMongo payments: Show grace period screen BEFORE creating order
    // This allows user to cancel within 10 seconds without creating any records
    if (isPayMongoPayment) {
      console.log(
        '[Checkout] Navigating to grace period screen for PayMongo payment'
      );
      console.log('[Checkout] pickupDate state:', pickupDate);
      console.log(
        '[Checkout] pickupDate.toISOString():',
        pickupDate.toISOString()
      );
      console.log(
        '[Checkout] orderPayload.pickup_datetime:',
        orderPayload.pickup_datetime
      );

      // Clear cart BEFORE navigating removed - we now clear it in the grace period screen AFTER successful order creation
      // This allows the user to cancel in grace period and have their items back
      // clearCart();

      // Prepare billing info - include card details if card payment
      const billingInfoPayload =
        paymentMethod === 'card'
          ? {
              name: billingName.trim(),
              email: billingEmail.trim().toLowerCase(),
              phone: billingPhone.trim() || undefined,
              // Card details for processing
              cardNumber: cardNumber.replace(/\s/g, ''),
              expMonth: parseInt(expMonth, 10),
              expYear: 2000 + parseInt(expYear, 10),
              cvc: cvc,
            }
          : {
              name: billingName.trim(),
              email: billingEmail.trim().toLowerCase(),
              phone: billingPhone.trim() || undefined,
            };

      // Navigate to grace period screen with order data
      // Order is NOT created yet - will be created after countdown ends
      // Use replace() to prevent back navigation through checkout flow
      replace(
        Routes.checkout.orderGracePeriod({
          orderData: JSON.stringify(orderPayload),
          paymentMethodType: paymentMethod, // Now contains actual type: gcash, paymaya, card
          billingInfo: JSON.stringify(billingInfoPayload),
          total: total.toString(),
        })
      );
      return;
    }

    // ========== Cash on Pickup Flow (unchanged) ==========
    // For COP: Create order immediately (no payment processing needed)
    try {
      setLoading(true);

      console.log('[Checkout] Creating COP order:', orderPayload);

      const orderResponse = await createOrder(orderPayload);

      console.log('[Checkout] Order created:', orderResponse);

      clearCart();

      // Go directly to confirmation
      replace(
        Routes.checkout.orderConfirmation({
          orderId: orderResponse.order_id,
          businessId: orderPayload.business_id,
        })
      );
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
                <Pressable onPress={() => back()}>
                  <Text style={[styles.editLink, { color: theme.active }]}>
                    Edit
                  </Text>
                </Pressable>
              </View>
              {items.slice(0, 3).map((item) => (
                <View key={item.product_id} style={styles.itemRow}>
                  {/* Product Image */}
                  <View
                    style={[
                      styles.itemImageContainer,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    {item.image_url ? (
                      <Image
                        source={{ uri: item.image_url }}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons
                        name="image-outline"
                        size={24}
                        color={theme.textSecondary}
                      />
                    )}
                  </View>
                  <View style={styles.itemDetails}>
                    <Text
                      style={[styles.itemName, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {item.product_name}
                    </Text>
                    <Text
                      style={[
                        styles.itemQuantity,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Qty: {item.quantity}
                    </Text>
                  </View>
                  <Text style={[styles.itemPrice, { color: theme.text }]}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
              {items.length > 3 && (
                <Pressable onPress={() => back()}>
                  <Text style={[styles.moreItems, { color: theme.active }]}>
                    +{items.length - 3} more items →
                  </Text>
                </Pressable>
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

              {/* Date Picker Modal */}
              <Modal
                visible={showDatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setShowDatePicker(false)}
                >
                  <View
                    style={[
                      styles.pickerModal,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <View style={styles.pickerHeader}>
                      <Text style={[styles.pickerTitle, { color: theme.text }]}>
                        Select Date
                      </Text>
                      <Pressable onPress={() => setShowDatePicker(false)}>
                        <Ionicons
                          name="close"
                          size={24}
                          color={theme.textSecondary}
                        />
                      </Pressable>
                    </View>
                    <View style={styles.pickerOptions}>
                      {availableDates.map((dateOption, index) => (
                        <Pressable
                          key={index}
                          style={[
                            styles.pickerOption,
                            {
                              backgroundColor:
                                pickupDate.toDateString() ===
                                dateOption.value.toDateString()
                                  ? theme.primary
                                  : theme.background,
                              borderColor: theme.border,
                            },
                          ]}
                          onPress={() => handleDateSelect(dateOption.value)}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              {
                                color:
                                  pickupDate.toDateString() ===
                                  dateOption.value.toDateString()
                                    ? '#FFF'
                                    : theme.text,
                              },
                            ]}
                          >
                            {dateOption.label}
                          </Text>
                          <Text
                            style={[
                              styles.pickerOptionSubtext,
                              {
                                color:
                                  pickupDate.toDateString() ===
                                  dateOption.value.toDateString()
                                    ? 'rgba(255,255,255,0.8)'
                                    : theme.textSecondary,
                              },
                            ]}
                          >
                            {dateOption.value.toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                            })}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </Pressable>
              </Modal>

              {/* Time Picker Modal */}
              <Modal
                visible={showTimePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowTimePicker(false)}
              >
                <Pressable
                  style={styles.modalOverlay}
                  onPress={() => setShowTimePicker(false)}
                >
                  <View
                    style={[
                      styles.pickerModal,
                      { backgroundColor: theme.surface },
                    ]}
                  >
                    <View style={styles.pickerHeader}>
                      <Text style={[styles.pickerTitle, { color: theme.text }]}>
                        Select Time
                      </Text>
                      <Pressable onPress={() => setShowTimePicker(false)}>
                        <Ionicons
                          name="close"
                          size={24}
                          color={theme.textSecondary}
                        />
                      </Pressable>
                    </View>
                    <FlatList
                      data={availableTimeSlots}
                      keyExtractor={(item) => `${item.hour}-${item.minute}`}
                      style={styles.timeScrollList}
                      showsVerticalScrollIndicator={false}
                      renderItem={({ item: slot }) => {
                        const isSelected =
                          pickupDate.getHours() === slot.hour &&
                          pickupDate.getMinutes() === slot.minute;
                        return (
                          <Pressable
                            style={[
                              styles.timeSlotOption,
                              {
                                backgroundColor: isSelected
                                  ? theme.primary
                                  : 'transparent',
                                borderColor: isSelected
                                  ? theme.primary
                                  : theme.border,
                              },
                            ]}
                            onPress={() =>
                              handleTimeSelect(slot.hour, slot.minute)
                            }
                          >
                            <Text
                              style={[
                                styles.timeSlotText,
                                { color: isSelected ? '#FFF' : theme.text },
                              ]}
                            >
                              {slot.label}
                            </Text>
                            {isSelected && (
                              <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color="#FFF"
                              />
                            )}
                          </Pressable>
                        );
                      }}
                    />
                  </View>
                </Pressable>
              </Modal>

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
                    borderColor: isOnlinePayment ? theme.accent : theme.border,
                    backgroundColor: isOnlinePayment
                      ? isDark
                        ? 'rgba(255, 183, 3, 0.1)'
                        : '#FFF9E6'
                      : theme.background,
                  },
                ]}
                onPress={() => setPaymentMethod('gcash')} // Default to gcash when selecting online
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
                      isOnlinePayment ? 'radio-button-on' : 'radio-button-off'
                    }
                    size={24}
                    color={isOnlinePayment ? theme.accent : theme.textSecondary}
                  />
                </View>

                {isOnlinePayment && (
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
                      Select Payment Provider
                    </Text>
                    <View style={styles.providerGrid}>
                      {/* GCash Option */}
                      <Pressable
                        style={[
                          styles.providerCard,
                          {
                            backgroundColor: theme.background,
                            borderColor:
                              paymentMethod === 'gcash'
                                ? '#007DFE'
                                : theme.border,
                            borderWidth: paymentMethod === 'gcash' ? 2 : 1,
                            opacity: paymentMethod === 'gcash' ? 1 : 0.7,
                          },
                        ]}
                        onPress={() => setPaymentMethod('gcash')}
                      >
                        <Image
                          source={require('@/assets/images/gcash.png')}
                          style={styles.providerLogo}
                          resizeMode="contain"
                        />
                        {paymentMethod === 'gcash' && (
                          <View style={styles.providerCheckmark}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="#007DFE"
                            />
                          </View>
                        )}
                      </Pressable>

                      {/* PayMaya Option */}
                      <Pressable
                        style={[
                          styles.providerCard,
                          {
                            backgroundColor: theme.background,
                            borderColor:
                              paymentMethod === 'paymaya'
                                ? '#00C853'
                                : theme.border,
                            borderWidth: paymentMethod === 'paymaya' ? 2 : 1,
                            opacity: paymentMethod === 'paymaya' ? 1 : 0.7,
                          },
                        ]}
                        onPress={() => setPaymentMethod('paymaya')}
                      >
                        <Image
                          source={require('@/assets/images/maya.jpg')}
                          style={styles.providerLogo}
                          resizeMode="contain"
                        />
                        {paymentMethod === 'paymaya' && (
                          <View style={styles.providerCheckmark}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="#00C853"
                            />
                          </View>
                        )}
                      </Pressable>

                      {/* Credit/Debit Card Option */}
                      <Pressable
                        style={[
                          styles.providerCard,
                          {
                            backgroundColor: theme.background,
                            borderColor:
                              paymentMethod === 'card'
                                ? '#6366F1'
                                : theme.border,
                            borderWidth: paymentMethod === 'card' ? 2 : 1,
                            opacity: paymentMethod === 'card' ? 1 : 0.7,
                          },
                        ]}
                        onPress={() => setPaymentMethod('card')}
                      >
                        <View
                          style={[
                            styles.providerIconBg,
                            {
                              backgroundColor: '#EEF2FF',
                              marginBottom: 4,
                            },
                          ]}
                        >
                          <Ionicons name="card" size={20} color="#6366F1" />
                        </View>
                        <Text
                          style={[
                            styles.providerCardTitle,
                            {
                              color: theme.text,
                              fontSize: 10,
                              textAlign: 'center',
                            },
                          ]}
                        >
                          Visa/Mastercard
                        </Text>
                        {paymentMethod === 'card' && (
                          <View style={styles.providerCheckmark}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="#6366F1"
                            />
                          </View>
                        )}
                      </Pressable>
                    </View>

                    {/* Inline Card Payment Form */}
                    {paymentMethod === 'card' && (
                      <View style={styles.cardFormSection}>
                        <View
                          style={[
                            styles.divider,
                            {
                              backgroundColor: theme.border,
                              marginVertical: 12,
                            },
                          ]}
                        />

                        <View style={styles.cardFormHeader}>
                          <Ionicons
                            name="lock-closed"
                            size={14}
                            color={theme.success}
                          />
                          <Text
                            style={[
                              styles.cardFormSecureText,
                              { color: theme.success },
                            ]}
                          >
                            Secure Card Entry
                          </Text>
                        </View>

                        {/* Card Number */}
                        <View style={styles.cardFormGroup}>
                          <Text
                            style={[
                              styles.cardFormLabel,
                              { color: theme.textSecondary },
                            ]}
                          >
                            Card Number
                          </Text>
                          <View
                            style={[
                              styles.cardInputContainer,
                              {
                                backgroundColor: theme.background,
                                borderColor: cardErrors.cardNumber
                                  ? theme.error
                                  : theme.border,
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                cardBrand === 'visa'
                                  ? 'card'
                                  : cardBrand === 'mastercard'
                                  ? 'card'
                                  : 'card-outline'
                              }
                              size={20}
                              color={theme.textSecondary}
                              style={{ marginRight: 10 }}
                            />
                            <TextInput
                              style={[styles.cardInput, { color: theme.text }]}
                              placeholder="1234 5678 9012 3456"
                              placeholderTextColor={theme.textSecondary}
                              value={cardNumber}
                              onChangeText={handleCardNumberChange}
                              keyboardType="numeric"
                              maxLength={19}
                              returnKeyType="next"
                            />
                          </View>
                          {cardErrors.cardNumber && (
                            <Text
                              style={[
                                styles.cardErrorText,
                                { color: theme.error },
                              ]}
                            >
                              {cardErrors.cardNumber}
                            </Text>
                          )}
                        </View>

                        {/* Expiry and CVC Row */}
                        <View style={styles.cardFormRow}>
                          <View
                            style={[
                              styles.cardFormGroup,
                              { flex: 1, marginRight: 8 },
                            ]}
                          >
                            <Text
                              style={[
                                styles.cardFormLabel,
                                { color: theme.textSecondary },
                              ]}
                            >
                              Expiry
                            </Text>
                            <View style={styles.expiryContainer}>
                              <TextInput
                                ref={expMonthRef}
                                style={[
                                  styles.expiryInput,
                                  {
                                    backgroundColor: theme.background,
                                    color: theme.text,
                                    borderColor: cardErrors.expMonth
                                      ? theme.error
                                      : theme.border,
                                  },
                                ]}
                                placeholder="MM"
                                placeholderTextColor={theme.textSecondary}
                                value={expMonth}
                                onChangeText={handleExpMonthChange}
                                keyboardType="numeric"
                                maxLength={2}
                              />
                              <Text
                                style={[
                                  styles.expirySeparator,
                                  { color: theme.textSecondary },
                                ]}
                              >
                                /
                              </Text>
                              <TextInput
                                ref={expYearRef}
                                style={[
                                  styles.expiryInput,
                                  {
                                    backgroundColor: theme.background,
                                    color: theme.text,
                                    borderColor: cardErrors.expYear
                                      ? theme.error
                                      : theme.border,
                                  },
                                ]}
                                placeholder="YY"
                                placeholderTextColor={theme.textSecondary}
                                value={expYear}
                                onChangeText={handleExpYearChange}
                                keyboardType="numeric"
                                maxLength={2}
                              />
                            </View>
                            {(cardErrors.expMonth || cardErrors.expYear) && (
                              <Text
                                style={[
                                  styles.cardErrorText,
                                  { color: theme.error },
                                ]}
                              >
                                {cardErrors.expMonth || cardErrors.expYear}
                              </Text>
                            )}
                          </View>

                          <View
                            style={[
                              styles.cardFormGroup,
                              { flex: 1, marginLeft: 8 },
                            ]}
                          >
                            <Text
                              style={[
                                styles.cardFormLabel,
                                { color: theme.textSecondary },
                              ]}
                            >
                              CVC
                            </Text>
                            <TextInput
                              ref={cvcRef}
                              style={[
                                styles.cvcInput,
                                {
                                  backgroundColor: theme.background,
                                  color: theme.text,
                                  borderColor: cardErrors.cvc
                                    ? theme.error
                                    : theme.border,
                                },
                              ]}
                              placeholder="123"
                              placeholderTextColor={theme.textSecondary}
                              value={cvc}
                              onChangeText={handleCvcChange}
                              keyboardType="numeric"
                              maxLength={4}
                              secureTextEntry
                            />
                            {cardErrors.cvc && (
                              <Text
                                style={[
                                  styles.cardErrorText,
                                  { color: theme.error },
                                ]}
                              >
                                {cardErrors.cvc}
                              </Text>
                            )}
                          </View>
                        </View>

                        {/* Cardholder Name */}
                        <View style={styles.cardFormGroup}>
                          <Text
                            style={[
                              styles.cardFormLabel,
                              { color: theme.textSecondary },
                            ]}
                          >
                            Cardholder Name
                          </Text>
                          <TextInput
                            style={[
                              styles.cardTextInput,
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
                        </View>

                        {/* Email */}
                        <View style={styles.cardFormGroup}>
                          <Text
                            style={[
                              styles.cardFormLabel,
                              { color: theme.textSecondary },
                            ]}
                          >
                            Email (for receipt)
                          </Text>
                          <TextInput
                            style={[
                              styles.cardTextInput,
                              {
                                backgroundColor: theme.background,
                                color: theme.text,
                                borderColor: theme.border,
                              },
                            ]}
                            placeholder="email@example.com"
                            placeholderTextColor={theme.textSecondary}
                            value={billingEmail}
                            onChangeText={setBillingEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                        </View>

                        {/* Security Badge */}
                        <View style={styles.cardSecurityBadge}>
                          <Ionicons
                            name="shield-checkmark"
                            size={14}
                            color={theme.success}
                          />
                          <Text
                            style={[
                              styles.cardSecurityText,
                              { color: theme.success },
                            ]}
                          >
                            256-bit SSL Encryption • PCI DSS Compliant
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </Pressable>

              {/* Billing Information - Only show for GCash/PayMaya (Card collects on dedicated page) */}
              {isOnlinePayment && paymentMethod !== 'card' && (
                <View style={styles.billingSection}>
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: theme.border, marginVertical: 16 },
                    ]}
                  />
                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        color: theme.text,
                        fontSize: type.h4,
                        marginBottom: 12,
                      },
                    ]}
                  >
                    Billing Information
                  </Text>
                  <Text
                    style={[
                      styles.billingHint,
                      { color: theme.textSecondary, marginBottom: 16 },
                    ]}
                  >
                    Required for {paymentMethod === 'gcash' ? 'GCash' : 'Maya'}{' '}
                    payment
                  </Text>

                  <Text
                    style={[styles.inputLabel, { color: theme.textSecondary }]}
                  >
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

                  <Text
                    style={[
                      styles.inputLabel,
                      { color: theme.textSecondary, marginTop: 12 },
                    ]}
                  >
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

                  <Text
                    style={[
                      styles.inputLabel,
                      { color: theme.textSecondary, marginTop: 12 },
                    ]}
                  >
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
  itemImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreItems: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  // Custom Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  pickerOptions: {
    gap: 10,
  },
  pickerOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerOptionSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  timeScrollList: {
    maxHeight: 300,
  },
  timeSlotOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: '500',
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
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  providerGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  providerCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    position: 'relative',
  },
  providerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  providerCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  providerCardSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  providerCheckmark: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  cardPaymentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  cardPaymentNoteText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  // Legacy styles kept for compatibility
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
  providerLogo: {
    width: '90%',
    height: 32,
  },
  // Inline Card Form Styles
  cardFormSection: {
    marginTop: 4,
  },
  cardFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  cardFormSecureText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFormGroup: {
    marginBottom: 12,
  },
  cardFormLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  cardFormRow: {
    flexDirection: 'row',
  },
  cardInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  cardInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  expirySeparator: {
    fontSize: 18,
    marginHorizontal: 6,
    fontWeight: '300',
  },
  cvcInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cardTextInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  cardErrorText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  cardSecurityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  cardSecurityText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default CheckoutScreen;
