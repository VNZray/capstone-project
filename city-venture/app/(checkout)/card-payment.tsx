import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  BackHandler,
  Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, colors } from '@/constants/color';
import PageContainer from '@/components/PageContainer';
import {
  createPaymentMethod,
  attachPaymentMethodClient,
  open3DSAuthentication,
  dismissBrowser,
  validateCardNumber,
  formatCardNumber,
  getCardBrand,
} from '@/services/PaymentIntentService';
import { Ionicons } from '@expo/vector-icons';
import API_URL from '@/services/api';
import { cancelOrder, getOrderById } from '@/services/OrderService';
import { useCart } from '@/context/CartContext';

/**
 * Card Payment Screen
 * Collects card details and processes payment via Payment Intent
 *
 * Features:
 * - Minimalist, compact design (Shopify-style)
 * - Card brand detection in input
 * - Clean validation states
 * - Secure payment trust signals
 * - Back button handling: cancels order and redirects to cart
 */
const CardPaymentScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors];
  const isDark = colorScheme === 'dark';
  const { restoreFromOrder } = useCart();

  const params = useLocalSearchParams<{
    orderId: string;
    orderNumber: string;
    arrivalCode: string;
    paymentIntentId: string;
    clientKey: string;
    amount: string;
    total: string;
  }>();

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [email, setEmail] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Input refs for auto-focus
  const expMonthRef = useRef<TextInput>(null);
  const expYearRef = useRef<TextInput>(null);
  const cvcRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);

  const cardBrand = getCardBrand(cardNumber);

  /**
   * Cancel the order and redirect user to cart with restored items
   */
  const cancelOrderAndRedirect = useCallback(async () => {
    if (!params.orderId) {
      router.replace(Routes.checkout.cart({ fromPaymentFailed: 'true' }));
      return;
    }

    try {
      setCancellingOrder(true);
      console.log('[CardPayment] Cancelling order:', params.orderId);

      // Fetch order details to restore cart items
      const orderDetails = await getOrderById(params.orderId);

      // Restore items to cart before cancelling
      if (orderDetails.items && orderDetails.items.length > 0) {
        restoreFromOrder(
          orderDetails.items.map((item) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            special_requests: item.special_requests,
            product_image_url: item.product_image_url,
          })),
          orderDetails.business_id,
          orderDetails.business_name
        );
        console.log('[CardPayment] Restored', orderDetails.items.length, 'items to cart');
      }

      // Cancel the order
      try {
        await cancelOrder(params.orderId);
        console.log('[CardPayment] Order cancelled successfully');
      } catch (cancelError: any) {
        // Order might have already been cancelled or in a non-cancellable state
        // Still proceed to cart since items are restored
        console.warn('[CardPayment] Order cancel failed (may already be cancelled):', cancelError.message);
      }

      // Navigate to cart
      router.replace(Routes.checkout.cart({ fromPaymentFailed: 'true' }));
    } catch (error: any) {
      console.error('[CardPayment] Failed to cancel order:', error);
      Alert.alert(
        'Error',
        'Failed to cancel order. Please try again.',
        [
          {
            text: 'Go to Cart Anyway',
            onPress: () => router.replace(Routes.checkout.cart({ fromPaymentFailed: 'true' })),
          },
          {
            text: 'Stay',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setCancellingOrder(false);
    }
  }, [params.orderId, restoreFromOrder]);

  /**
   * Handle back navigation - cancel order and redirect to cart
   * This prevents users from going back to stale order-grace-period screen
   */
  const handleBackNavigation = useCallback(() => {
    if (loading || cancellingOrder) {
      // Don't allow back during payment processing
      return true;
    }

    // Show confirmation dialog
    Alert.alert(
      'Cancel Payment?',
      'Going back will cancel this order. Your items will be restored to your cart.',
      [
        {
          text: 'Stay',
          style: 'cancel',
        },
        {
          text: 'Cancel Order',
          style: 'destructive',
          onPress: () => {
            cancelOrderAndRedirect();
          },
        },
      ]
    );

    return true; // Prevent default back behavior
  }, [loading, cancellingOrder, cancelOrderAndRedirect]);

  /**
   * Handle hardware back button press on Android
   * Cancels the order and redirects to cart instead of going back to grace period
   */
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleBackNavigation();
        return true; // Prevent default back behavior
      }
    );

    return () => backHandler.remove();
  }, [handleBackNavigation]);

  // Get card brand icon for input
  const getCardBrandIcon = () => {
    switch (cardBrand) {
      case 'visa':
        return <Ionicons name="card" size={24} color="#1A1F71" />;
      case 'mastercard':
        return <Ionicons name="card" size={24} color="#EB001B" />;
      default:
        return (
          <Ionicons name="card-outline" size={24} color={theme.textSecondary} />
        );
    }
  };

  // Format card number as user types
  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
    // Auto focus check
    if (formatted.replace(/\s/g, '').length === 16) {
      expMonthRef.current?.focus();
    }
  };

  // Handle expiry month input
  const handleExpMonthChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 2) {
      setExpMonth(digits);
      if (errors.expMonth) {
        setErrors((prev) => ({ ...prev, expMonth: '' }));
      }
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
      if (errors.expYear) {
        setErrors((prev) => ({ ...prev, expYear: '' }));
      }
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
      if (errors.cvc) {
        setErrors((prev) => ({ ...prev, cvc: '' }));
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardNumber(cleanCardNumber)) {
      newErrors.cardNumber = 'Invalid card number';
    }

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

    if (expMonth && expYear && !newErrors.expMonth && !newErrors.expYear) {
      const now = new Date();
      const expDate = new Date(2000 + year, month, 0);
      if (expDate < now) {
        newErrors.expMonth = 'Card expired';
      }
    }

    if (!cvc) {
      newErrors.cvc = 'Required';
    } else if (cvc.length < 3) {
      newErrors.cvc = 'Invalid';
    }

    if (!cardholderName.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Map PayMongo error codes to user-friendly messages
   */
  const getErrorMessage = (
    err: any
  ): { title: string; message: string; isCardError: boolean } => {
    const subCode =
      err.response?.data?.errors?.[0]?.sub_code ||
      err.sub_code ||
      err.response?.data?.last_payment_error?.sub_code ||
      err.last_payment_error?.sub_code;

    const errorCode =
      err.response?.data?.errors?.[0]?.code ||
      err.code ||
      err.response?.data?.last_payment_error?.code ||
      err.last_payment_error?.code;

    const GENERIC_DECLINE_MESSAGE =
      'Your card was declined. Please contact your bank or try a different card.';

    if (err.message?.includes('declined') || err.message?.includes('card')) {
      return {
        title: 'Payment Failed',
        message: err.message || GENERIC_DECLINE_MESSAGE,
        isCardError: true,
      };
    }

    return {
      title: 'Payment Failed',
      message: err.message || 'Processing failed. Please try again.',
      isCardError: true,
    };
  };

  const navigateToPaymentFailed = (error: any) => {
    const { title, message, isCardError } = getErrorMessage(error);
    router.replace(
      Routes.checkout.paymentFailed({
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        arrivalCode: params.arrivalCode,
        total: params.total,
        errorMessage: message,
        errorTitle: title,
        isCardError: isCardError ? 'true' : 'false',
        orderCreated: 'true',
      })
    );
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    if (!params.paymentIntentId || !params.clientKey) {
      navigateToPaymentFailed({ message: 'Missing payment information.' });
      return;
    }

    try {
      setLoading(true);

      const backendBaseUrl = (API_URL || '').replace('/api', '');
      const returnUrl = `${backendBaseUrl}/orders/${params.orderId}/payment-success`;

      // Step 1: Create Payment Method
      const paymentMethodResponse = await createPaymentMethod(
        'card',
        {
          card_number: cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(expMonth, 10),
          exp_year: 2000 + parseInt(expYear, 10),
          cvc: cvc,
        },
        {
          name: cardholderName.trim(),
          email: email.trim().toLowerCase(),
        }
      );

      const paymentMethodId = paymentMethodResponse.data.id;

      // Step 2: Attach to Intent
      const attachResponse = await attachPaymentMethodClient(
        params.paymentIntentId,
        paymentMethodId,
        params.clientKey,
        returnUrl
      );

      const status = attachResponse.data.attributes.status;
      const nextAction = attachResponse.data.attributes.next_action;
      const lastPaymentError = (attachResponse.data.attributes as any)
        .last_payment_error;

      if (lastPaymentError) {
        navigateToPaymentFailed({ last_payment_error: lastPaymentError });
        return;
      }

      if (status === 'awaiting_next_action' && nextAction?.redirect?.url) {
        const authResult = await open3DSAuthentication(
          nextAction.redirect.url,
          returnUrl
        );

        dismissBrowser();

        if (authResult.type === 'cancel') {
          router.replace(
            Routes.checkout.paymentCancel({
              orderId: params.orderId,
              orderNumber: params.orderNumber,
              reason: 'cancelled',
            })
          );
          return;
        }

        router.replace(
          Routes.checkout.paymentProcessing({
            orderId: params.orderId,
            orderNumber: params.orderNumber,
            arrivalCode: params.arrivalCode,
            paymentIntentId: params.paymentIntentId,
            total: params.total,
          })
        );
        return;
      }

      if (status === 'succeeded' || status === 'processing') {
        const route =
          status === 'succeeded'
            ? Routes.checkout.orderConfirmation({
                orderId: params.orderId,
                orderNumber: params.orderNumber,
                arrivalCode: params.arrivalCode,
                total: params.total,
                paymentMethod: 'paymongo',
                paymentSuccess: 'true',
              })
            : Routes.checkout.paymentProcessing({
                orderId: params.orderId,
                orderNumber: params.orderNumber,
                arrivalCode: params.arrivalCode,
                paymentIntentId: params.paymentIntentId,
                total: params.total,
              });

        router.replace(route);
        return;
      }

      navigateToPaymentFailed({
        message: 'Payment incomplete. Please try again.',
      });
    } catch (error: any) {
      console.error('[CardPayment] Error:', error);
      navigateToPaymentFailed(error);
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill for dev/testing
  useEffect(() => {
    // Optional: Remove for production or keep for demo
    setCardholderName('Test User');
    setEmail('test@example.com');
  }, []);

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          gestureEnabled: false, // Prevent iOS swipe-back gesture
        }} 
      />
      {/* Loading overlay when cancelling order */}
      {cancellingOrder && (
        <View style={styles.cancelOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.cancelOverlayText}>Cancelling order...</Text>
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <PageContainer>
          <View
            style={[styles.container, { backgroundColor: theme.background }]}
          >
            {/* Header with back button */}
            <View style={styles.header}>
              <Pressable 
                style={styles.backButton} 
                onPress={handleBackNavigation}
                disabled={loading || cancellingOrder}
              >
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </Pressable>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Order #{params.orderNumber}
              </Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Order Amount Section */}
              <View style={styles.amountSection}>
                <Text
                  style={[styles.totalLabel, { color: theme.textSecondary }]}
                >
                  Total Due
                </Text>
                <Text style={[styles.totalAmount, { color: theme.text }]}>
                  ₱
                  {parseFloat(
                    params.total || params.amount || '0'
                  ).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Secure Badge */}
              <View
                style={[styles.secureBadge, { backgroundColor: theme.surface }]}
              >
                <Ionicons name="lock-closed" size={14} color={theme.success} />
                <Text
                  style={[styles.secureText, { color: theme.textSecondary }]}
                >
                  All transactions are secure and encrypted.
                </Text>
              </View>

              {/* Form Fields */}
              <View style={styles.formContainer}>
                {/* Contact Info (Compact) */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Contact
                </Text>
                <View style={[styles.inputGroup, { marginBottom: 20 }]}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: errors.email ? theme.error : theme.border,
                      },
                    ]}
                    placeholder="Email for receipt"
                    placeholderTextColor={theme.textSecondary}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  {errors.email && (
                    <Text style={[styles.errorText, { color: theme.error }]}>
                      {errors.email}
                    </Text>
                  )}
                </View>

                {/* Card Details */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Card Details
                </Text>

                {/* Name on Card */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    Name on card
                  </Text>
                  <TextInput
                    ref={nameRef}
                    style={[
                      styles.input,
                      {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: errors.name ? theme.error : theme.border,
                      },
                    ]}
                    placeholder="Full Name"
                    placeholderTextColor={theme.textSecondary}
                    value={cardholderName}
                    onChangeText={(text) => {
                      setCardholderName(text);
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    editable={!loading}
                  />
                </View>

                {/* Card Number */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    Card number
                  </Text>
                  <View
                    style={[
                      styles.inputWithIcon,
                      {
                        backgroundColor: theme.inputBackground,
                        borderColor: errors.cardNumber
                          ? theme.error
                          : focusedField === 'cardNumber'
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.inputFlex, { color: theme.text }]}
                      placeholder="0000 0000 0000 0000"
                      placeholderTextColor={theme.textSecondary}
                      value={cardNumber}
                      onChangeText={handleCardNumberChange}
                      onFocus={() => setFocusedField('cardNumber')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="numeric"
                      maxLength={19}
                      editable={!loading}
                    />
                    <View style={styles.iconContainer}>
                      {getCardBrandIcon()}
                    </View>
                  </View>
                  {errors.cardNumber && (
                    <Text style={[styles.errorText, { color: theme.error }]}>
                      {errors.cardNumber}
                    </Text>
                  )}
                </View>

                {/* Expiry & CVC */}
                <View style={styles.row}>
                  <View
                    style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}
                  >
                    <Text
                      style={[styles.label, { color: theme.textSecondary }]}
                    >
                      Expiry (MM/YY)
                    </Text>
                    <View style={styles.expiryRow}>
                      <TextInput
                        ref={expMonthRef}
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: errors.expMonth
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
                        editable={!loading}
                      />
                      <Text
                        style={{
                          color: theme.textSecondary,
                          marginHorizontal: 8,
                          alignSelf: 'center',
                        }}
                      >
                        /
                      </Text>
                      <TextInput
                        ref={expYearRef}
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: errors.expYear
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
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text
                      style={[styles.label, { color: theme.textSecondary }]}
                    >
                      Security Code
                    </Text>
                    <TextInput
                      ref={cvcRef}
                      style={[
                        styles.input,
                        {
                          backgroundColor: theme.inputBackground,
                          color: theme.text,
                          borderColor: errors.cvc ? theme.error : theme.border,
                        },
                      ]}
                      placeholder="CVC"
                      placeholderTextColor={theme.textSecondary}
                      value={cvc}
                      onChangeText={handleCvcChange}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      editable={!loading}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View
              style={[
                styles.footer,
                {
                  backgroundColor: theme.surface,
                  borderTopColor: theme.border,
                },
              ]}
            >
              <Pressable
                style={[
                  styles.payButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: loading ? 0.7 : 1,
                  },
                ]}
                onPress={handlePayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.payButtonText}>
                    Pay ₱
                    {parseFloat(
                      params.total || params.amount || '0'
                    ).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </Text>
                )}
              </Pressable>
            </View>
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
  cancelOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  cancelOverlayText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  amountSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 32,
    gap: 8,
  },
  secureText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputFlex: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  iconContainer: {
    marginLeft: 10,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  expiryRow: {
    flexDirection: 'row',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  payButton: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CardPaymentScreen;
