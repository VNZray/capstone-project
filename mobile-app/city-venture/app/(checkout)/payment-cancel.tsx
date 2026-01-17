/**
 * Payment Cancel Screen
 * Displayed when user cancels/closes PayMongo payment without completing
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { Routes } from "@/routes/mainRoutes";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { colors } from "@/constants/color";
import { useTypography } from "@/constants/typography";
import PageContainer from "@/components/PageContainer";
import { Ionicons } from "@expo/vector-icons";
import { getOrderById } from "@/services/OrderService";
import { useCart } from "@/context/CartContext";
import {
  createPaymentIntent,
  attachEwalletPaymentMethod,
  open3DSAuthentication,
  dismissBrowser,
} from "@/services/PaymentIntentService";
import API_URL from "@/services/api/api";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const PaymentCancelScreen = () => {
  const params = useLocalSearchParams<{ orderId: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const type = useTypography();
  const { h1, h2, body, bodySmall } = type;
  const [retrying, setRetrying] = useState(false);
  const [changingPaymentMethod, setChangingPaymentMethod] = useState(false);
  const { restoreFromOrder } = useCart();

  // Animations
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const shake = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    scale.value = withSpring(1, { damping: 12 });
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { damping: 15 });

    // Shake effect for error icon
    shake.value = withSequence(
      withTiming(10, { duration: 100 }),
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 }),
    );
  }, []);

  const palette = {
    bg: isDark ? "#0D1B2A" : "#F8F9FA",
    card: isDark ? "#1C2833" : "#FFFFFF",
    text: isDark ? "#ECEDEE" : "#0D1B2A",
    subText: isDark ? "#9BA1A6" : "#6B7280",
    border: isDark ? "#2A2F36" : "#E5E8EC",
    errorBg: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
  };

  const handleRetryPayment = async () => {
    try {
      setRetrying(true);
      console.log(
        "[PaymentCancel] Retrying payment for order:",
        params.orderId,
      );

      // Get order details to determine payment method type
      const orderDetails = await getOrderById(params.orderId);

      // Use payment_method as the primary field (stores 'gcash', 'paymaya', 'card', 'cash_on_pickup')
      // Fallback to deprecated payment_method_type for backward compatibility
      let paymentMethodType = orderDetails.payment_method;

      // Skip cash_on_pickup since it doesn't need online payment
      if (paymentMethodType === "cash_on_pickup") {
        Alert.alert(
          "Payment Method",
          "This order uses cash on pickup. No online payment needed.",
          [{ text: "OK" }],
        );
        setRetrying(false);
        return;
      }

      // Fallback to deprecated field if payment_method is not an e-wallet/card type
      if (!["gcash", "paymaya", "card"].includes(paymentMethodType)) {
        paymentMethodType = orderDetails.payment_method_type || "gcash";
      }

      console.log("[PaymentCancel] Using payment method:", paymentMethodType);

      // Create Payment Intent using unified API
      // This REUSES the existing order (no ghost data) - backend will:
      // 1. Detect retry scenario if order status = failed_payment
      // 2. Create new Payment Intent for the SAME order
      // 3. Reset order status to 'pending' and re-deduct stock if needed
      const intentResponse = await createPaymentIntent({
        payment_for: "order",
        reference_id: params.orderId,
        payment_method: paymentMethodType,
      });

      const paymentIntentId = intentResponse.data.payment_intent_id;
      const clientKey = intentResponse.data.client_key;

      // For card payments, navigate to card payment screen with NEW payment intent
      // This reuses the existing order instead of creating a new one
      if (paymentMethodType === "card") {
        console.log(
          "[PaymentCancel] Card payment - navigating to card-payment screen for retry",
        );
        router.replace(
          Routes.checkout.cardPayment({
            orderId: params.orderId,
            orderNumber: orderDetails.order_number,
            arrivalCode: orderDetails.arrival_code,
            paymentIntentId,
            clientKey,
            amount: intentResponse.data.amount.toString(),
            total: orderDetails.total_amount?.toString(),
          }),
        );
        return;
      }

      // For e-wallets, attach payment method and redirect (Client-Side)
      const backendBaseUrl = (API_URL || "").replace("/api", "");
      const returnUrl = `${backendBaseUrl}/orders/${params.orderId}/payment-success`;

      const attachResponse = await attachEwalletPaymentMethod(
        paymentIntentId,
        paymentMethodType as "gcash" | "paymaya",
        returnUrl,
        intentResponse.data.client_key, // Pass client_key for direct PayMongo call
      );

      const nextAction = attachResponse.data.attributes.next_action;
      if (nextAction?.redirect?.url) {
        const authResult = await open3DSAuthentication(
          nextAction.redirect.url,
          returnUrl,
        );

        dismissBrowser();

        if (authResult.type === "cancel" || authResult.type === "dismiss") {
          Alert.alert(
            "Payment Cancelled",
            "You cancelled the payment. You can try again later.",
            [{ text: "OK" }],
          );
          return;
        }

        // Navigate to payment processing to verify
        router.replace(
          Routes.checkout.paymentProcessing({
            orderId: params.orderId,
            orderNumber: orderDetails.order_number,
            arrivalCode: orderDetails.arrival_code,
            paymentIntentId,
            total: orderDetails.total_amount?.toString(),
          }),
        );
      }
    } catch (error: any) {
      console.error("[PaymentCancel] Payment retry failed:", error);
      Alert.alert(
        "Payment Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to start payment process",
      );
    } finally {
      setRetrying(false);
    }
  };

  const handleViewOrder = () => {
    router.replace(Routes.profile.orders.detail(params.orderId));
  };

  const handleBackToHome = () => {
    router.replace(Routes.tabs.home);
  };

  /**
   * Handle "Change Payment Method" - restore order items to cart and navigate to checkout
   * with prefilled data so user can select a different payment method
   */
  const handleChangePaymentMethod = async () => {
    if (!params.orderId) {
      router.replace(
        Routes.checkout.index({ fromChangePaymentMethod: "true" }),
      );
      return;
    }

    try {
      setChangingPaymentMethod(true);
      console.log(
        "[PaymentCancel] Changing payment method for order:",
        params.orderId,
      );

      // Fetch order details to get items and restore to cart
      const orderDetails = await getOrderById(params.orderId);

      if (orderDetails.items && orderDetails.items.length > 0) {
        // Restore items to cart
        restoreFromOrder(
          orderDetails.items.map((item: any) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            special_requests: item.special_requests,
            product_image_url: item.product_image_url,
          })),
          orderDetails.business_id,
          orderDetails.business_name,
        );
        console.log(
          "[PaymentCancel] Restored",
          orderDetails.items.length,
          "items to cart",
        );
      }

      // Navigate to checkout with prefilled order info (excluding payment method so user can choose new one)
      router.replace(
        Routes.checkout.index({
          prefillOrderId: params.orderId,
          prefillBillingName: orderDetails.billing_name || undefined,
          prefillBillingEmail: orderDetails.billing_email || undefined,
          prefillBillingPhone: orderDetails.billing_phone || undefined,
          prefillPickupDatetime: orderDetails.pickup_datetime || undefined,
          prefillSpecialInstructions:
            orderDetails.special_instructions || undefined,
          fromChangePaymentMethod: "true",
        }),
      );
    } catch (error: any) {
      console.error("[PaymentCancel] Failed to change payment method:", error);
      Alert.alert(
        "Error",
        "Unable to change payment method. Please try again.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace(
                Routes.checkout.index({ fromChangePaymentMethod: "true" }),
              ),
          },
        ],
      );
    } finally {
      setChangingPaymentMethod(false);
    }
  };

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
    opacity: opacity.value,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <PageContainer>
        <View style={[styles.container, { backgroundColor: palette.bg }]}>
          <View style={styles.content}>
            <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
              <LinearGradient
                colors={[colors.error, "#EF4444"]}
                style={styles.gradientIcon}
              >
                <Ionicons name="close" size={64} color="#FFF" />
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={[styles.contentWrapper, animatedContentStyle]}
            >
              <Text
                style={[
                  {
                    fontSize: h1,
                    color: palette.text,
                    textAlign: "center",
                    marginBottom: 8,
                  },
                ]}
              >
                Payment Failed
              </Text>
              <Text
                style={[
                  {
                    fontSize: body,
                    color: palette.subText,
                    textAlign: "center",
                    marginBottom: 32,
                    paddingHorizontal: 20,
                  },
                ]}
              >
                We couldn't process your payment. Please try again or use a
                different payment method.
              </Text>

              <View
                style={[
                  styles.infoCard,
                  {
                    backgroundColor: palette.card,
                    borderColor: palette.border,
                  },
                ]}
              >
                <View style={styles.infoRow}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={24}
                    color={colors.warning}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[
                        {
                          fontSize: bodySmall,
                          color: palette.text,
                          fontWeight: "600",
                          marginBottom: 4,
                        },
                      ]}
                    >
                      Don't worry!
                    </Text>
                    <Text
                      style={[
                        {
                          fontSize: bodySmall,
                          color: palette.subText,
                          lineHeight: 20,
                        },
                      ]}
                    >
                      Your order is saved as pending. You can retry payment now
                      to confirm your order.
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.primaryButton,
                    { backgroundColor: colors.primary },
                    (retrying || changingPaymentMethod) &&
                      styles.disabledButton,
                  ]}
                  onPress={handleRetryPayment}
                  disabled={retrying || changingPaymentMethod}
                >
                  {retrying ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Retry Payment</Text>
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.secondaryButton,
                    { borderColor: palette.border },
                    changingPaymentMethod && styles.disabledButton,
                  ]}
                  onPress={handleChangePaymentMethod}
                  disabled={retrying || changingPaymentMethod}
                >
                  {changingPaymentMethod ? (
                    <ActivityIndicator size="small" color={palette.text} />
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Ionicons
                        name="swap-horizontal"
                        size={18}
                        color={palette.text}
                      />
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          { color: palette.text },
                        ]}
                      >
                        Change Payment Method
                      </Text>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.secondaryButton,
                    { borderColor: palette.border },
                  ]}
                  onPress={handleViewOrder}
                  disabled={retrying || changingPaymentMethod}
                >
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      { color: palette.text },
                    ]}
                  >
                    View Order Details
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.textButton]}
                  onPress={handleBackToHome}
                >
                  <Text
                    style={[styles.textButtonText, { color: palette.subText }]}
                  >
                    Back to Home
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </View>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 24,
    marginTop: -40,
  },
  iconWrapper: {
    marginBottom: 24,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    width: "100%",
    alignItems: "center",
  },
  infoCard: {
    width: "100%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  textButton: {
    width: "100%",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  textButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default PaymentCancelScreen;
