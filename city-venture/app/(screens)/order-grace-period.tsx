/**
 * Order Grace Period Screen
 * FoodPanda/GrabFood style - Shows a 10-second countdown before processing payment
 * 
 * Flow:
 * 1. User clicks "Place Order" in checkout
 * 2. Navigate to this screen with order data (NOT created yet)
 * 3. Show 10-second countdown with cancel option
 * 4. If user cancels → go back to checkout (no order created, no payment intent)
 * 5. If countdown completes → create order + payment intent → proceed to payment
 * 
 * This ensures:
 * - No order is created until user commits (after grace period)
 * - No payment intent is created until after grace period
 * - User has clear escape window to cancel
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import PageContainer from '@/components/PageContainer';
import { Ionicons } from '@expo/vector-icons';
import { createOrder } from '@/services/OrderService';
import {
  createPaymentIntent,
  attachEwalletPaymentMethod,
  open3DSAuthentication,
  dismissBrowser,
} from '@/services/PaymentIntentService';
import API_URL from '@/services/api';
import type { CreateOrderPayload } from '@/types/Order';

// Grace period duration in seconds
const GRACE_PERIOD_SECONDS = 10;

const OrderGracePeriodScreen = () => {
  const params = useLocalSearchParams<{
    orderData: string;
    paymentMethodType: string;
    billingInfo: string;
    total: string;
  }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors];

  // Parse order data from params - memoize to avoid dependency changes
  const orderData = useMemo<CreateOrderPayload | null>(() => {
    return params.orderData 
      ? JSON.parse(params.orderData as string) 
      : null;
  }, [params.orderData]);
  
  const billingInfo = useMemo(() => {
    return params.billingInfo 
      ? JSON.parse(params.billingInfo as string) 
      : {};
  }, [params.billingInfo]);
  
  const paymentMethodType = (params.paymentMethodType as string) || 'gcash';
  const totalAmount = parseFloat((params.total as string) || '0');

  // State
  const [countdown, setCountdown] = useState(GRACE_PERIOD_SECONDS);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const hasStartedPayment = useRef(false);

  // Animation for countdown circle
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  /**
   * Process the order and payment after grace period ends
   */
  const proceedWithPayment = useCallback(async () => {
    // Prevent double execution
    if (hasStartedPayment.current) return;
    hasStartedPayment.current = true;

    if (!orderData) {
      Alert.alert('Error', 'Order data not found. Please try again.');
      router.back();
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStep('Creating your order...');

      // Step 1: Create the order in backend
      console.log('[GracePeriod] Creating order...');
      const orderResponse = await createOrder(orderData);
      console.log('[GracePeriod] Order created:', orderResponse.order_number);

      const orderId = orderResponse.order_id;
      const orderNumber = orderResponse.order_number;
      const arrivalCode = orderResponse.arrival_code;

      setProcessingStep('Initializing payment...');

      // Step 2: Create Payment Intent
      console.log('[GracePeriod] Creating payment intent...');
      const intentResponse = await createPaymentIntent({
        order_id: orderId,
        payment_method_types: [paymentMethodType],
      });

      const paymentIntentId = intentResponse.data.payment_intent_id;
      console.log('[GracePeriod] Payment intent created:', paymentIntentId);

      // Step 3: Handle based on payment method type
      if (paymentMethodType === 'card') {
        // Navigate to card payment screen
        router.replace({
          pathname: '/(screens)/card-payment',
          params: {
            orderId,
            orderNumber,
            arrivalCode,
            paymentIntentId,
            clientKey: intentResponse.data.client_key,
            amount: intentResponse.data.amount.toString(),
            total: totalAmount.toString(),
          },
        } as never);
        return;
      }

      // For e-wallets (GCash, Maya, GrabPay)
      setProcessingStep('Connecting to payment provider...');

      // Generate return URL
      const backendBaseUrl = API_URL.replace('/api', '');
      const returnUrl = `${backendBaseUrl}/orders/${orderId}/payment-success`;

      // Attach e-wallet payment method
      const attachResponse = await attachEwalletPaymentMethod(
        paymentIntentId,
        paymentMethodType as 'gcash' | 'paymaya' | 'grab_pay',
        returnUrl,
        billingInfo
      );

      console.log('[GracePeriod] Attachment response:', attachResponse.data.status);

      // Check if redirect is needed (for e-wallet authorization)
      if (attachResponse.data.redirect_url) {
        setProcessingStep('Opening payment app...');
        console.log('[GracePeriod] Opening e-wallet authorization:', attachResponse.data.redirect_url);

        const authResult = await open3DSAuthentication(
          attachResponse.data.redirect_url,
          returnUrl
        );

        console.log('[GracePeriod] Auth session completed:', authResult.type);
        dismissBrowser();

        // Handle based on auth session result type
        // Note: 'dismiss' can happen when:
        // 1. User manually closes browser (actual cancel)
        // 2. Deep link fires and closes browser (payment may have succeeded)
        // We navigate to processing screen to verify actual payment status
        if (authResult.type === 'cancel') {
          // Explicit cancel - user tapped cancel button
          console.log('[GracePeriod] User explicitly cancelled payment authorization');
          router.replace({
            pathname: '/(screens)/payment-cancel',
            params: {
              orderId,
              orderNumber,
              reason: 'cancelled',
            },
          } as never);
          return;
        }

        // For 'dismiss' or 'success', navigate to processing screen to verify payment status
        // The deep link handler will show appropriate feedback
        console.log('[GracePeriod] Auth session ended, verifying payment status...');

        // After user returns from e-wallet, navigate to processing screen
        router.replace({
          pathname: '/(screens)/payment-processing',
          params: {
            orderId,
            orderNumber,
            arrivalCode,
            paymentIntentId,
            total: totalAmount.toString(),
          },
        } as never);
        return;
      }

      // If no redirect needed (unlikely for e-wallets), payment may have succeeded
      if (attachResponse.data.status === 'succeeded') {
        router.replace({
          pathname: '/(screens)/order-confirmation',
          params: {
            orderId,
            orderNumber,
            arrivalCode,
            total: totalAmount.toString(),
            paymentMethod: 'paymongo',
            paymentSuccess: 'true',
          },
        } as never);
        return;
      }

      // Fallback - go to processing screen
      router.replace({
        pathname: '/(screens)/payment-processing',
        params: {
          orderId,
          orderNumber,
          arrivalCode,
          paymentIntentId,
          total: totalAmount.toString(),
        },
      } as never);

    } catch (error: any) {
      console.error('[GracePeriod] Error processing order:', error);
      hasStartedPayment.current = false; // Allow retry
      
      let errorMessage = 'Failed to process your order. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        'Order Failed',
        errorMessage,
        [
          {
            text: 'Try Again',
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  }, [orderData, paymentMethodType, billingInfo, totalAmount]);

  // Start countdown animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: GRACE_PERIOD_SECONDS * 1000,
      useNativeDriver: false,
    }).start();

    // Pulse animation for countdown number
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [progressAnim, pulseAnim]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || isProcessing || isCancelling) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Vibrate when countdown ends
          if (Platform.OS !== 'web') {
            Vibration.vibrate(100);
          }
          return 0;
        }
        // Vibrate on last 3 seconds
        if (prev <= 4 && Platform.OS !== 'web') {
          Vibration.vibrate(50);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isProcessing, isCancelling]);

  // When countdown reaches 0, proceed with payment
  useEffect(() => {
    if (countdown === 0 && !isProcessing && !isCancelling) {
      proceedWithPayment();
    }
  }, [countdown, isProcessing, isCancelling, proceedWithPayment]);

  /**
   * Handle cancel button press
   * Returns user to checkout without creating order or payment
   */
  const handleCancel = useCallback(() => {
    setIsCancelling(true);
    
    Alert.alert(
      'Cancel Order?',
      'Are you sure you want to cancel? Your order has not been placed yet.',
      [
        {
          text: 'No, Continue',
          style: 'cancel',
          onPress: () => setIsCancelling(false),
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  }, []);

  // Calculate progress for circle
  const circleSize = 200;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  // Render processing state
  if (isProcessing) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Processing',
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
        <PageContainer>
          <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.processingContainer, { backgroundColor: theme.surface }]}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.processingTitle, { color: theme.text }]}>
                {processingStep}
              </Text>
              <Text style={[styles.processingSubtitle, { color: theme.textSecondary }]}>
                Please wait while we process your order
              </Text>
            </View>
          </View>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Confirm Order',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      <PageContainer>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Ready to order?
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Your order will be placed in
            </Text>
          </View>

          {/* Countdown Circle */}
          <View style={styles.countdownContainer}>
            <View style={styles.circleContainer}>
              {/* Background Circle */}
              <View
                style={[
                  styles.circleBackground,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    borderWidth: strokeWidth,
                    borderColor: theme.border,
                  },
                ]}
              />
              
              {/* Progress Circle using SVG-like approach */}
              <Animated.View
                style={[
                  styles.progressCircle,
                  {
                    width: circleSize,
                    height: circleSize,
                    borderRadius: circleSize / 2,
                    borderWidth: strokeWidth,
                    borderColor: countdown <= 3 ? theme.error : theme.primary,
                    borderTopColor: 'transparent',
                    borderRightColor: 'transparent',
                    transform: [
                      {
                        rotate: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />

              {/* Countdown Number */}
              <Animated.View
                style={[
                  styles.countdownTextContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Text
                  style={[
                    styles.countdownNumber,
                    {
                      color: countdown <= 3 ? theme.error : theme.primary,
                      fontSize: 64,
                    },
                  ]}
                >
                  {countdown}
                </Text>
                <Text style={[styles.countdownLabel, { color: theme.textSecondary }]}>
                  seconds
                </Text>
              </Animated.View>
            </View>
          </View>

          {/* Order Summary */}
          <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
            <View style={styles.summaryRow}>
              <Ionicons name="receipt-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Total Amount
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                ₱{totalAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="card-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Payment
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {paymentMethodType === 'gcash' ? 'GCash' :
                 paymentMethodType === 'paymaya' ? 'PayMaya' :
                 paymentMethodType === 'grab_pay' ? 'GrabPay' :
                 paymentMethodType === 'card' ? 'Credit/Debit Card' :
                 paymentMethodType.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Info Message */}
          <View style={[styles.infoContainer, { backgroundColor: `${theme.info}15` }]}>
            <Ionicons name="information-circle" size={24} color={theme.info} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              Your order will not be created until the countdown ends. 
              You can cancel anytime during this period.
            </Text>
          </View>

          {/* Cancel Button */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.cancelButton,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.error,
                },
              ]}
              onPress={handleCancel}
              disabled={isCancelling}
            >
              <Ionicons name="close-circle" size={24} color={theme.error} />
              <Text style={[styles.cancelButtonText, { color: theme.error }]}>
                Cancel Order
              </Text>
            </Pressable>

            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              You&apos;ll be redirected to payment after countdown
            </Text>
          </View>
        </View>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBackground: {
    position: 'absolute',
  },
  progressCircle: {
    position: 'absolute',
  },
  countdownTextContainer: {
    alignItems: 'center',
  },
  countdownNumber: {
    fontWeight: '800',
  },
  countdownLabel: {
    fontSize: 14,
    marginTop: -8,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    width: '100%',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    marginTop: 16,
    fontSize: 12,
    textAlign: 'center',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 40,
    marginVertical: 40,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default OrderGracePeriodScreen;
