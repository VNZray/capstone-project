import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import PageContainer from '@/components/PageContainer';
import {
  createPaymentMethod,
  attachPaymentMethodClient,
  open3DSAuthentication,
  dismissBrowser,
  validateCardNumber,
  formatCardNumber,
  getCardBrand,
  TEST_CARDS,
} from '@/services/PaymentIntentService';
import { Ionicons } from '@expo/vector-icons';
import API_URL from '@/services/api';

/**
 * Card Payment Screen
 * Collects card details and processes payment via Payment Intent
 */
const CardPaymentScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors];

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
  const [cardNumber, setCardNumber] = useState('4120000000000007');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('25');
  const [cvc, setCvc] = useState('123');
  const [cardholderName, setCardholderName] = useState('TestName');
  const [email, setEmail] = useState('test@gmail.com');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Input refs for auto-focus
  const expMonthRef = useRef<TextInput>(null);
  const expYearRef = useRef<TextInput>(null);
  const cvcRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const cardBrand = getCardBrand(cardNumber);

  // Format card number as user types
  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);

    // Clear error when user starts typing
    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: '' }));
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
      if (errors.expYear) {
        setErrors((prev) => ({ ...prev, expYear: '' }));
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
      if (errors.cvc) {
        setErrors((prev) => ({ ...prev, cvc: '' }));
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
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
      const expDate = new Date(2000 + year, month, 0); // Last day of exp month
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

    // Name validation (optional but recommended)
    if (!cardholderName.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation (required for PayMongo)
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Process payment
  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    if (!params.paymentIntentId || !params.clientKey) {
      Alert.alert('Error', 'Missing payment information');
      return;
    }

    try {
      setLoading(true);

      // Generate return URL for 3DS redirect
      // PayMongo requires https:// URLs - use backend's redirect bridge endpoint
      const backendBaseUrl = (API_URL || '').replace('/api', '');
      const returnUrl = `${backendBaseUrl}/orders/${params.orderId}/payment-success`;
      console.log('[CardPayment] Return URL for PayMongo:', returnUrl);

      // Step 1: Create Payment Method (client-side using public key)
      console.log('[CardPayment] Creating payment method...');
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
      console.log('[CardPayment] Payment method created:', paymentMethodId);

      // Step 2: Attach Payment Method to Payment Intent
      console.log('[CardPayment] Attaching payment method...');
      const attachResponse = await attachPaymentMethodClient(
        params.paymentIntentId,
        paymentMethodId,
        params.clientKey,
        returnUrl
      );

      const status = attachResponse.data.attributes.status;
      const nextAction = attachResponse.data.attributes.next_action;

      console.log('[CardPayment] Attach result:', status);

      // Step 3: Handle different statuses
      if (status === 'awaiting_next_action' && nextAction?.redirect?.url) {
        // 3DS authentication required
        console.log('[CardPayment] 3DS authentication required');

        // Use in-app browser session for 3DS
        const authResult = await open3DSAuthentication(
          nextAction.redirect.url,
          returnUrl
        );

        console.log('[CardPayment] 3DS auth result:', authResult.type);

        // Dismiss any lingering browser
        dismissBrowser();

        // Check if user cancelled
        if (authResult.type === 'cancel' || authResult.type === 'dismiss') {
          console.log('[CardPayment] User cancelled 3DS authentication');
          Alert.alert(
            'Payment Cancelled',
            'You cancelled the payment authentication. You can retry or pay later.',
            [
              {
                text: 'Go to Order',
                onPress: () => {
                  router.replace(
                    Routes.checkout.orderConfirmation({
                      orderId: params.orderId,
                      orderNumber: params.orderNumber,
                      arrivalCode: params.arrivalCode,
                      total: params.total,
                      paymentMethod: 'paymongo',
                      paymentPending: 'true',
                      paymentCancelled: 'true',
                    })
                  );
                },
              },
              {
                text: 'Retry',
                style: 'cancel',
              },
            ]
          );
          return;
        }

        // Navigate to processing screen to check result
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

      if (status === 'succeeded') {
        // Payment successful without 3DS
        console.log('[CardPayment] Payment succeeded immediately');

        router.replace(
          Routes.checkout.orderConfirmation({
            orderId: params.orderId,
            orderNumber: params.orderNumber,
            arrivalCode: params.arrivalCode,
            total: params.total,
            paymentMethod: 'paymongo',
            paymentSuccess: 'true',
          })
        );
        return;
      }

      if (status === 'processing') {
        // Payment is processing
        console.log('[CardPayment] Payment processing');

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

      // Unexpected status
      throw new Error(`Unexpected payment status: ${status}`);
    } catch (error: any) {
      console.error('[CardPayment] Error:', error);

      let errorMessage = 'Payment failed. Please try again.';

      if (error.message) {
        if (error.message.includes('card')) {
          errorMessage = error.message;
        } else if (error.message.includes('declined')) {
          errorMessage = 'Your card was declined. Please try a different card.';
        } else if (
          error.message.includes('network') ||
          error.message.includes('timeout')
        ) {
          errorMessage =
            'Network error. Please check your connection and try again.';
        }
      }

      Alert.alert('Payment Failed', errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  // Fill test card for development
  const fillTestCard = () => {
    setCardNumber(formatCardNumber(TEST_CARDS.SUCCESS));
    setExpMonth('12');
    setExpYear('28');
    setCvc('123');
    setCardholderName('Test User');
    setEmail('test@example.com');
  };

  const getCardIcon = () => {
    switch (cardBrand) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Card Payment',
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
            {/* Order Summary */}
            <View
              style={[styles.summaryCard, { backgroundColor: theme.surface }]}
            >
              <View style={styles.summaryRow}>
                <Text
                  style={[styles.summaryLabel, { color: theme.textSecondary }]}
                >
                  Order #{params.orderNumber}
                </Text>
                <Text style={[styles.summaryAmount, { color: theme.text }]}>
                  ₱{params.total || params.amount}
                </Text>
              </View>
            </View>

            {/* Card Form */}
            <View style={[styles.formCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Card Details
              </Text>

              {/* Card Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Card Number
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.background,
                      borderColor: errors.cardNumber
                        ? theme.error
                        : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={getCardIcon() as any}
                    size={24}
                    color={theme.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor={theme.textSecondary}
                    value={cardNumber}
                    onChangeText={handleCardNumberChange}
                    keyboardType="numeric"
                    maxLength={19}
                    returnKeyType="next"
                    onSubmitEditing={() => expMonthRef.current?.focus()}
                  />
                </View>
                {errors.cardNumber && (
                  <Text style={[styles.errorText, { color: theme.error }]}>
                    {errors.cardNumber}
                  </Text>
                )}
              </View>

              {/* Expiry and CVC Row */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    Expiry
                  </Text>
                  <View style={styles.expiryRow}>
                    <TextInput
                      ref={expMonthRef}
                      style={[
                        styles.expiryInput,
                        {
                          backgroundColor: theme.background,
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
                      returnKeyType="next"
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
                      returnKeyType="next"
                    />
                  </View>
                  {(errors.expMonth || errors.expYear) && (
                    <Text style={[styles.errorText, { color: theme.error }]}>
                      {errors.expMonth || errors.expYear}
                    </Text>
                  )}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    CVC
                  </Text>
                  <TextInput
                    ref={cvcRef}
                    style={[
                      styles.cvcInput,
                      {
                        backgroundColor: theme.background,
                        color: theme.text,
                        borderColor: errors.cvc ? theme.error : theme.border,
                      },
                    ]}
                    placeholder="123"
                    placeholderTextColor={theme.textSecondary}
                    value={cvc}
                    onChangeText={handleCvcChange}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    returnKeyType="next"
                    onSubmitEditing={() => nameRef.current?.focus()}
                  />
                  {errors.cvc && (
                    <Text style={[styles.errorText, { color: theme.error }]}>
                      {errors.cvc}
                    </Text>
                  )}
                </View>
              </View>

              {/* Cardholder Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Cardholder Name
                </Text>
                <TextInput
                  ref={nameRef}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: errors.name ? theme.error : theme.border,
                    },
                  ]}
                  placeholder="John Doe"
                  placeholderTextColor={theme.textSecondary}
                  value={cardholderName}
                  onChangeText={(text) => {
                    setCardholderName(text);
                    if (errors.name)
                      setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
                {errors.name && (
                  <Text style={[styles.errorText, { color: theme.error }]}>
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  Email (for receipt)
                </Text>
                <TextInput
                  ref={emailRef}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: theme.background,
                      color: theme.text,
                      borderColor: errors.email ? theme.error : theme.border,
                    },
                  ]}
                  placeholder="email@example.com"
                  placeholderTextColor={theme.textSecondary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email)
                      setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handlePayment}
                />
                {errors.email && (
                  <Text style={[styles.errorText, { color: theme.error }]}>
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Security Badge */}
              <View style={styles.securityBadge}>
                <Ionicons name="lock-closed" size={14} color={theme.success} />
                <Text style={[styles.securityText, { color: theme.success }]}>
                  Secured by PayMongo • 256-bit SSL
                </Text>
              </View>
            </View>

            {/* Test Card Button (Dev only) */}
            {__DEV__ && (
              <Pressable
                style={[styles.testButton, { backgroundColor: theme.surface }]}
                onPress={fillTestCard}
              >
                <Text
                  style={[
                    styles.testButtonText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Fill Test Card (Dev Only)
                </Text>
              </Pressable>
            )}
          </ScrollView>

          {/* Pay Button */}
          <View
            style={[
              styles.bottomBar,
              { backgroundColor: theme.surface, borderTopColor: theme.border },
            ]}
          >
            <Pressable
              style={[
                styles.payButton,
                {
                  backgroundColor: loading ? theme.disabled : theme.primary,
                  opacity: loading ? 0.8 : 1,
                },
              ]}
              onPress={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="lock-closed" size={20} color="#FFF" />
                  <Text style={styles.payButtonText}>
                    Pay ₱{params.total || params.amount}
                  </Text>
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
    paddingBottom: 120,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    textAlign: 'center',
  },
  expirySeparator: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  cvcInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  testButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    fontSize: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default CardPaymentScreen;
