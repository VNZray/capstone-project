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

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
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
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Routes } from "@/routes/mainRoutes";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/color";
import PageContainer from "@/components/PageContainer";
import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { createOrder } from "@/services/OrderService";
import {
  createPaymentIntent,
  attachEwalletPaymentMethod,
  open3DSAuthentication,
  dismissBrowser,
  createPaymentMethod,
  attachPaymentMethodClient,
} from "@/services/PaymentIntentService";
import API_URL from "@/services/api/api";
import type { CreateOrderPayload } from "@/types/Order";

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
  const { clearCart } = useCart();

  // Parse order data from params - memoize to avoid dependency changes
  const orderData = useMemo<CreateOrderPayload | null>(() => {
    return params.orderData ? JSON.parse(params.orderData as string) : null;
  }, [params.orderData]);

  const billingInfo = useMemo(() => {
    return params.billingInfo ? JSON.parse(params.billingInfo as string) : {};
  }, [params.billingInfo]);

  const paymentMethodType = (params.paymentMethodType as string) || "gcash";
  const totalAmount = parseFloat((params.total as string) || "0");

  // State
  const [countdown, setCountdown] = useState(GRACE_PERIOD_SECONDS);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const hasStartedPayment = useRef(false);

  // Track created order for error handling (so user can view order if payment fails)
  const createdOrderRef = useRef<{
    orderId: string;
    orderNumber: string;
    arrivalCode: string;
  } | null>(null);

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
      Alert.alert("Error", "Order data not found. Please try again.");
      router.back();
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingStep("Creating your order...");

      // Step 1: Create the order in backend
      console.log("[GracePeriod] Creating order...");
      console.log("[GracePeriod] orderData:", orderData);
      console.log(
        "[GracePeriod] orderData.pickup_datetime:",
        orderData.pickup_datetime,
      );
      const orderResponse = await createOrder(orderData);
      console.log("[GracePeriod] Order created:", orderResponse.order_number);

      // Clear cart now that order is successfully created
      clearCart();

      const orderId = orderResponse.order_id;
      const orderNumber = orderResponse.order_number;
      const arrivalCode = orderResponse.arrival_code;

      // Store order details for error handling
      createdOrderRef.current = { orderId, orderNumber, arrivalCode };

      setProcessingStep("Initializing payment...");

      // Step 2: Create Payment Intent using unified API
      console.log(
        "[GracePeriod] Creating payment intent with method:",
        paymentMethodType,
      );
      const intentResponse = await createPaymentIntent({
        payment_for: "order",
        reference_id: orderId,
        payment_method: paymentMethodType as "card" | "gcash" | "paymaya",
      });

      const paymentIntentId = intentResponse.data.payment_intent_id;
      console.log("[GracePeriod] Payment intent created:", paymentIntentId);

      // Step 3: Handle based on payment method type
      if (paymentMethodType === "card") {
        // Process card payment inline using card details from billingInfo
        setProcessingStep("Processing card payment...");
        console.log("[GracePeriod] Processing card payment inline");

        // Generate return URL
        const backendBaseUrl = API_URL ? API_URL.replace("/api", "") : "";
        const returnUrl = `${backendBaseUrl}/orders/${orderId}/payment-success`;

        // Step 3a: Create Payment Method using card details from billingInfo
        console.log("[GracePeriod] Creating card payment method...");
        const paymentMethodResponse = await createPaymentMethod(
          "card",
          {
            card_number: billingInfo.cardNumber,
            exp_month: billingInfo.expMonth,
            exp_year: billingInfo.expYear,
            cvc: billingInfo.cvc,
          },
          {
            name: billingInfo.name,
            email: billingInfo.email,
          },
        );

        const paymentMethodId = paymentMethodResponse.data.id;
        console.log(
          "[GracePeriod] Card payment method created:",
          paymentMethodId,
        );

        // Step 3b: Attach Payment Method to Payment Intent
        setProcessingStep("Verifying card...");
        console.log("[GracePeriod] Attaching card payment method...");
        const attachResponse = await attachPaymentMethodClient(
          paymentIntentId,
          paymentMethodId,
          intentResponse.data.client_key,
          returnUrl,
        );

        const cardStatus = attachResponse.data.attributes.status;
        const cardNextAction = attachResponse.data.attributes.next_action;

        console.log("[GracePeriod] Card attach result:", cardStatus);

        // Step 3c: Handle 3DS if required
        if (
          cardStatus === "awaiting_next_action" &&
          cardNextAction?.redirect?.url
        ) {
          setProcessingStep("Verifying with your bank...");
          console.log("[GracePeriod] 3DS authentication required");

          const authResult = await open3DSAuthentication(
            cardNextAction.redirect.url,
            returnUrl,
          );

          console.log("[GracePeriod] 3DS auth result:", authResult.type);
          dismissBrowser();

          if (authResult.type === "cancel") {
            console.log("[GracePeriod] User cancelled 3DS authentication");
            router.replace(
              Routes.checkout.paymentCancel({
                orderId,
                orderNumber,
                reason: "cancelled",
              }),
            );
            return;
          }

          // Navigate to processing screen to verify result
          router.replace(
            Routes.checkout.paymentProcessing({
              orderId,
              orderNumber,
              arrivalCode,
              paymentIntentId,
              total: totalAmount.toString(),
            }),
          );
          return;
        }

        // Card payment succeeded without 3DS
        if (cardStatus === "succeeded") {
          console.log("[GracePeriod] Card payment succeeded immediately");
          router.replace(
            Routes.checkout.orderConfirmation({
              orderId,
              orderNumber,
              arrivalCode,
              total: totalAmount.toString(),
              paymentMethod: "paymongo",
              paymentSuccess: "true",
            }),
          );
          return;
        }

        // Payment processing
        if (cardStatus === "processing") {
          router.replace(
            Routes.checkout.paymentProcessing({
              orderId,
              orderNumber,
              arrivalCode,
              paymentIntentId,
              total: totalAmount.toString(),
            }),
          );
          return;
        }

        // Unexpected status - go to processing to verify
        router.replace(
          Routes.checkout.paymentProcessing({
            orderId,
            orderNumber,
            arrivalCode,
            paymentIntentId,
            total: totalAmount.toString(),
          }),
        );
        return;
      }

      // For e-wallets (GCash, Maya)
      setProcessingStep("Connecting to payment provider...");

      // Generate return URL
      const backendBaseUrl = API_URL ? API_URL.replace("/api", "") : "";
      const returnUrl = `${backendBaseUrl}/orders/${orderId}/payment-success`;

      // Attach e-wallet payment method (Client-Side - direct to PayMongo)
      const attachResponse = await attachEwalletPaymentMethod(
        paymentIntentId,
        paymentMethodType as "gcash" | "paymaya",
        returnUrl,
        intentResponse.data.client_key, // Pass client_key for direct PayMongo call
        billingInfo,
      );

      console.log(
        "[GracePeriod] Attachment response:",
        attachResponse.data.attributes.status,
      );

      // Check if redirect is needed (for e-wallet authorization)
      const nextAction = attachResponse.data.attributes.next_action;
      if (nextAction?.redirect?.url) {
        setProcessingStep("Opening payment app...");
        console.log(
          "[GracePeriod] Opening e-wallet authorization:",
          nextAction.redirect.url,
        );

        const authResult = await open3DSAuthentication(
          nextAction.redirect.url,
          returnUrl,
        );

        console.log("[GracePeriod] Auth session completed:", authResult.type);
        dismissBrowser();

        // Handle based on auth session result type
        // Note: 'dismiss' can happen when:
        // 1. User manually closes browser (actual cancel)
        // 2. Deep link fires and closes browser (payment may have succeeded)
        // We navigate to processing screen to verify actual payment status
        if (authResult.type === "cancel") {
          // Explicit cancel - user tapped cancel button
          console.log(
            "[GracePeriod] User explicitly cancelled payment authorization",
          );
          router.replace(
            Routes.checkout.paymentCancel({
              orderId,
              orderNumber,
              reason: "cancelled",
            }),
          );
          return;
        }

        // For 'dismiss' or 'success', navigate to processing screen to verify payment status
        // The deep link handler will show appropriate feedback
        console.log(
          "[GracePeriod] Auth session ended, verifying payment status...",
        );

        // After user returns from e-wallet, navigate to processing screen
        router.replace(
          Routes.checkout.paymentProcessing({
            orderId,
            orderNumber,
            arrivalCode,
            paymentIntentId,
            total: totalAmount.toString(),
          }),
        );
        return;
      }

      // If no redirect needed (unlikely for e-wallets), payment may have succeeded
      if (attachResponse.data.attributes.status === "succeeded") {
        router.replace(
          Routes.checkout.orderConfirmation({
            orderId,
            orderNumber,
            arrivalCode,
            total: totalAmount.toString(),
            paymentMethod: "paymongo",
            paymentSuccess: "true",
          }),
        );
        return;
      }

      // Fallback - go to processing screen
      router.replace(
        Routes.checkout.paymentProcessing({
          orderId,
          orderNumber,
          arrivalCode,
          paymentIntentId,
          total: totalAmount.toString(),
        }),
      );
    } catch (error: any) {
      console.error("[GracePeriod] Error processing order:", error);
      // IMPORTANT: Do NOT reset hasStartedPayment.current to false here!
      // This was causing double order creation when the useEffect re-triggered.
      // Once payment processing has failed, the user must navigate to payment-failed
      // screen and manually retry from there.

      // Map PayMongo error codes to user-friendly messages
      const getErrorMessage = (
        err: any,
      ): { title: string; message: string; isCardError: boolean } => {
        // Extract sub_code from multiple possible locations in the error structure:
        // 1. err.response.data.errors[0].sub_code - From axios error response
        // 2. err.sub_code - Directly attached by PaymentIntentService
        // 3. err.response.data.last_payment_error.sub_code - From Payment Intent status
        const subCode =
          err.response?.data?.errors?.[0]?.sub_code ||
          err.sub_code ||
          err.response?.data?.last_payment_error?.sub_code ||
          err.last_payment_error?.sub_code;

        // Extract error code similarly
        const errorCode =
          err.response?.data?.errors?.[0]?.code ||
          err.code ||
          err.response?.data?.last_payment_error?.code ||
          err.last_payment_error?.code;

        // Log for debugging (will help identify unmapped error codes)
        if (subCode || errorCode) {
          console.log("[GracePeriod] PayMongo error codes:", {
            subCode,
            errorCode,
            fullError: err.response?.data || err.message,
          });
        }

        // Generic message for security-sensitive errors (fraud, lost/stolen cards)
        // PayMongo recommends NOT exposing these details to customers
        const GENERIC_DECLINE_MESSAGE =
          "Your card was declined. Please contact your bank or try a different card.";

        // ===== DECLINED TRANSACTIONS =====
        const declinedMessages: Record<string, string> = {
          generic_decline:
            "Your card was declined. Please contact your bank or try a different card.",
          do_not_honor:
            "Your card was declined. Please contact your bank or try a different card.",
          payment_refused:
            "Payment was refused. Please try a different card or payment method.",
          insufficient_funds:
            "Insufficient funds. Please try a different card or payment method.",
          debit_card_usage_limit_exceeded:
            "Card usage limit exceeded. Please try a different card or payment method.",
          issuer_declined:
            "Your bank declined this transaction. Please contact them for more information.",
          issuer_not_available:
            "We couldn't reach your bank. Please wait a few minutes and try again.",
          amount_allowed_exceeded:
            "Amount exceeds your card limit. Please contact your bank or try a different card.",
          call_card_issuer:
            "Please contact your bank for more information, then try again.",
          card_not_supported:
            "This card type is not supported. Please try a different card.",
          card_type_mismatch:
            "Card type mismatch. Please verify your card details and try again.",
          card_unauthorized:
            "This card is not authorized for online payments. Please contact your bank or try a different card.",
          credit_limit_exceeded:
            "Credit limit exceeded. Please try a different card or payment method.",
          currency_not_supported_by_card_issuer:
            "Your card does not support this currency. Please try a different card.",
        };

        // ===== BLOCKED TRANSACTIONS (Security-sensitive - use generic message) =====
        const blockedCodes = [
          "fraudulent",
          "highest_risk_level",
          "lost_card",
          "pickup_card",
          "processor_blocked",
          "restricted_card",
          "stolen_card",
          "blocked",
        ];

        // ===== PROCESSOR ERRORS =====
        // Note: 'processor_unavailable' is from test card 5500000000000194
        const processorMessages: Record<string, string> = {
          avs_failed:
            "Address verification failed. Please check your billing address and try again.",
          card_not_accepted:
            "This card type is not accepted. Please try a different card.",
          config_invalid_or_missing:
            "Payment processing error. Please try again or contact support.",
          customer_blacklisted:
            "This payment cannot be processed. Please contact support.",
          merchant_configuration_invalid:
            "Payment processing error. Please try again or contact support.",
          processing_error:
            "Payment processing error. Please wait a few minutes and try again.",
          processor_declined:
            "Payment was declined. Please try a different card or payment method.",
          processor_timeout:
            "Payment timed out. Please try again or contact support.",
          processor_unavailable:
            "Payment processor unavailable. Please wait a few minutes and try again, or use a different card.",
          system_error:
            "System error. Please try again later or contact support.",
        };

        // ===== UNKNOWN ERRORS =====
        const unknownErrorCodes = [
          "server_timeout",
          "service_timeout",
          "unknown_error",
        ];

        // ===== INVALID CARD DETAILS =====
        // Note: PayMongo returns 'card_expired' (not 'expired_card') for test card 4200000000000018
        const invalidCardMessages: Record<string, string> = {
          card_number_invalid:
            "Invalid card number. Please verify your card details and try again.",
          cvc_invalid:
            "Invalid security code (CVC). Please check and try again.",
          cvc_incorrect:
            "Incorrect security code (CVC). Please check and try again.",
          card_expired: "Your card has expired. Please use a different card.",
          expired_card: "Your card has expired. Please use a different card.",
          card_type_mismatch:
            "Card type mismatch. Please verify your card details and try again.",
        };

        // Check if it's a card-related error
        if (errorCode === "resource_failed_state" || subCode) {
          // Check blocked transactions first (use generic message for security)
          if (blockedCodes.includes(subCode)) {
            return {
              title: "Card Declined",
              message: GENERIC_DECLINE_MESSAGE,
              isCardError: true,
            };
          }

          // Check unknown errors
          if (unknownErrorCodes.includes(subCode)) {
            return {
              title: "Payment Error",
              message:
                "Payment failed due to an unknown error. Please try again or contact support.",
              isCardError: true,
            };
          }

          // Check invalid card details
          if (invalidCardMessages[subCode]) {
            return {
              title: "Invalid Card Details",
              message: invalidCardMessages[subCode],
              isCardError: true,
            };
          }

          // Check processor errors
          if (processorMessages[subCode]) {
            return {
              title: "Payment Error",
              message: processorMessages[subCode],
              isCardError: true,
            };
          }

          // Check declined transactions
          if (declinedMessages[subCode]) {
            return {
              title: "Card Declined",
              message: declinedMessages[subCode],
              isCardError: true,
            };
          }

          // Default to generic decline for any unmapped error
          return {
            title: "Card Declined",
            message: GENERIC_DECLINE_MESSAGE,
            isCardError: true,
          };
        }

        // Generic payment errors
        if (
          err.message?.includes("declined") ||
          err.message?.includes("card")
        ) {
          return {
            title: "Payment Failed",
            message:
              err.message ||
              "Your payment could not be processed. Please try again or use a different payment method.",
            isCardError: true,
          };
        }

        // Order creation errors
        if (err.response?.data?.message) {
          return {
            title: "Order Failed",
            message: err.response.data.message,
            isCardError: false,
          };
        }

        // Generic error
        return {
          title: "Something Went Wrong",
          message:
            err.message || "Failed to process your order. Please try again.",
          isCardError: false,
        };
      };

      const { title, message, isCardError } = getErrorMessage(error);
      const orderCreated = createdOrderRef.current !== null;

      // Navigate to payment-failed screen instead of showing alert
      // This completely exits this screen and prevents any re-triggering
      router.replace(
        Routes.checkout.paymentFailed({
          orderId: orderCreated ? createdOrderRef.current!.orderId : undefined,
          orderNumber: orderCreated
            ? createdOrderRef.current!.orderNumber
            : undefined,
          errorMessage: message,
          errorTitle: title,
          isCardError: isCardError ? "true" : "false",
          orderCreated: orderCreated ? "true" : "false",
        }),
      );
    } finally {
      setIsProcessing(false);
    }
  }, [orderData, paymentMethodType, billingInfo, totalAmount, clearCart]);

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
      ]),
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
          if (Platform.OS !== "web") {
            Vibration.vibrate(100);
          }
          return 0;
        }
        // Vibrate on last 3 seconds
        if (prev <= 4 && Platform.OS !== "web") {
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
      "Cancel Order?",
      "Are you sure you want to cancel? Your order has not been placed yet.",
      [
        {
          text: "No, Continue",
          style: "cancel",
          onPress: () => setIsCancelling(false),
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            router.back();
          },
        },
      ],
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
            title: "Processing",
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.text,
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        />
        <PageContainer>
          <View
            style={[styles.container, { backgroundColor: theme.background }]}
          >
            <View
              style={[
                styles.processingContainer,
                { backgroundColor: theme.surface },
              ]}
            >
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.processingTitle, { color: theme.text }]}>
                {processingStep}
              </Text>
              <Text
                style={[
                  styles.processingSubtitle,
                  { color: theme.textSecondary },
                ]}
              >
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
          title: "Confirm Order",
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
                    borderTopColor: "transparent",
                    borderRightColor: "transparent",
                    transform: [
                      {
                        rotate: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "360deg"],
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
                <Text
                  style={[
                    styles.countdownLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  seconds
                </Text>
              </Animated.View>
            </View>
          </View>

          {/* Order Summary */}
          <View
            style={[styles.summaryCard, { backgroundColor: theme.surface }]}
          >
            <View style={styles.summaryRow}>
              <Ionicons
                name="receipt-outline"
                size={20}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.summaryLabel, { color: theme.textSecondary }]}
              >
                Total Amount
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                ₱{totalAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons
                name="card-outline"
                size={20}
                color={theme.textSecondary}
              />
              <Text
                style={[styles.summaryLabel, { color: theme.textSecondary }]}
              >
                Payment
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {paymentMethodType === "gcash"
                  ? "GCash"
                  : paymentMethodType === "paymaya"
                    ? "PayMaya"
                    : paymentMethodType === "card"
                      ? "Credit/Debit Card"
                      : paymentMethodType.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Info Message */}
          <View
            style={[
              styles.infoContainer,
              { backgroundColor: `${theme.info}15` },
            ]}
          >
            <Ionicons name="information-circle" size={24} color={theme.info} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              Your order will not be created until the countdown ends. You can
              cancel anytime during this period.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Proceed Now Button */}
            <Pressable
              style={[
                styles.proceedButton,
                {
                  backgroundColor: theme.primary,
                },
              ]}
              onPress={() => {
                setCountdown(0); // This triggers proceedWithPayment via useEffect
              }}
              disabled={isCancelling || isProcessing}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.proceedButtonText}>Proceed Now</Text>
            </Pressable>

            {/* Cancel Button */}
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
              Or wait for countdown to proceed automatically
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
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circleContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  circleBackground: {
    position: "absolute",
  },
  progressCircle: {
    position: "absolute",
  },
  countdownTextContainer: {
    alignItems: "center",
  },
  countdownNumber: {
    fontWeight: "800",
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    gap: 12,
  },
  proceedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    width: "100%",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footerText: {
    marginTop: 16,
    fontSize: 12,
    textAlign: "center",
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    padding: 40,
    marginVertical: 40,
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    textAlign: "center",
  },
  processingSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

export default OrderGracePeriodScreen;
