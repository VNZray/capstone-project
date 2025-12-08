import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import PageContainer from '@/components/PageContainer';
import { Ionicons } from '@expo/vector-icons';
import { getOrderById } from '@/services/OrderService';
import { useCart } from '@/context/CartContext';
import {
  createPaymentIntent,
  attachEwalletPaymentMethod,
  open3DSAuthentication,
  dismissBrowser,
} from '@/services/PaymentIntentService';
import API_URL from '@/services/api';

/**
 * Payment Failed Screen
 * Shown when payment fails, with options to retry or view order
 *
 * Handles two scenarios:
 * 1. Order was created but payment failed → Show retry payment option
 * 2. Order was not created → Go back to checkout
 */
const PaymentFailedScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[(colorScheme ?? 'light') as keyof typeof Colors];
  const [retrying, setRetrying] = useState(false);
  const [goingToCart, setGoingToCart] = useState(false);
  const [changingPaymentMethod, setChangingPaymentMethod] = useState(false);
  const { restoreFromOrder } = useCart();

  const params = useLocalSearchParams<{
    orderId?: string;
    orderNumber?: string;
    arrivalCode?: string;
    total?: string;
    errorMessage?: string;
    errorTitle?: string;
    isCardError?: string;
    orderCreated?: string;
  }>();

  const orderCreated = params.orderCreated === 'true';
  const isCardError = params.isCardError === 'true';
  const errorTitle = params.errorTitle || 'Payment Failed';

  /**
   * Handle "Go back to cart" - restore order items to cart and navigate
   */
  const handleGoToCart = async () => {
    if (!params.orderId) {
      // No order - just go to cart
      router.replace(Routes.checkout.cart({ fromPaymentFailed: 'true' }));
      return;
    }

    try {
      setGoingToCart(true);
      console.log(
        '[PaymentFailed] Restoring items from order:',
        params.orderId
      );

      // Fetch order details to get items
      const orderDetails = await getOrderById(params.orderId);

      if (orderDetails.items && orderDetails.items.length > 0) {
        // Restore items to cart
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
        console.log(
          '[PaymentFailed] Restored',
          orderDetails.items.length,
          'items to cart'
        );
      }

      // Navigate to cart
      router.replace(Routes.checkout.cart({ fromPaymentFailed: 'true' }));
    } catch (error: any) {
      console.error('[PaymentFailed] Failed to restore cart:', error);
      Alert.alert(
        'Could not restore cart',
        'Unable to restore your items. Going to cart anyway.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                Routes.checkout.cart({ fromPaymentFailed: 'true' })
              ),
          },
        ]
      );
    } finally {
      setGoingToCart(false);
    }
  };

  /**
   * Handle retry payment for existing order
   * Creates a new payment intent and redirects to e-wallet auth
   */
  const handleRetryPayment = async () => {
    if (!params.orderId) {
      Alert.alert(
        'Error',
        'Order not found. Please try again from your orders.'
      );
      return;
    }

    try {
      setRetrying(true);
      console.log(
        '[PaymentFailed] Retrying payment for order:',
        params.orderId
      );

      // Get order details to determine payment method type
      const orderDetails = await getOrderById(params.orderId);

      // Use payment_method as the primary field (stores 'gcash', 'paymaya', 'card', 'cash_on_pickup')
      // Fallback to deprecated payment_method_type for backward compatibility
      let paymentMethodType = orderDetails.payment_method;

      // Skip cash_on_pickup since it doesn't need online payment
      if (paymentMethodType === 'cash_on_pickup') {
        Alert.alert(
          'Payment Method',
          'This order uses cash on pickup. No online payment needed.',
          [{ text: 'OK' }]
        );
        setRetrying(false);
        return;
      }

      // Fallback to deprecated field if payment_method is not an e-wallet/card type
      if (!['gcash', 'paymaya', 'card'].includes(paymentMethodType)) {
        paymentMethodType = orderDetails.payment_method_type || 'gcash';
      }

      console.log('[PaymentFailed] Using payment method:', paymentMethodType);

      // Create Payment Intent using unified API
      // This REUSES the existing order (no ghost data) - backend will:
      // 1. Detect retry scenario (order status = failed_payment)
      // 2. Create new Payment Intent for the SAME order
      // 3. Reset order status to 'pending' and re-deduct stock
      const intentResponse = await createPaymentIntent({
        payment_for: 'order',
        reference_id: params.orderId,
        payment_method: paymentMethodType,
      });

      const paymentIntentId = intentResponse.data.payment_intent_id;
      const clientKey = intentResponse.data.client_key;

      // For card payments, navigate to card-payment screen with NEW payment intent
      // This reuses the existing order instead of creating a new one
      if (paymentMethodType === 'card') {
        console.log('[PaymentFailed] Card payment - navigating to card-payment screen for retry');
        console.log('[PaymentFailed] New Payment Intent:', paymentIntentId);
        
        // Navigate to card-payment screen with payment intent details
        // User will re-enter card details there (we can't store them securely)
        router.replace(
          Routes.checkout.cardPayment({
            orderId: params.orderId,
            orderNumber: orderDetails.order_number || params.orderNumber || '',
            arrivalCode: orderDetails.arrival_code || params.arrivalCode || '',
            paymentIntentId,
            clientKey,
            total: orderDetails.total_amount?.toString() || params.total || '0',
          })
        );
        return;
      }

      // For e-wallets, attach payment method and redirect
      const backendBaseUrl = (API_URL || '').replace('/api', '');
      const returnUrl = `${backendBaseUrl}/orders/${params.orderId}/payment-success`;

      const attachResponse = await attachEwalletPaymentMethod(
        paymentIntentId,
        paymentMethodType as 'gcash' | 'paymaya',
        returnUrl,
        intentResponse.data.client_key
      );

      const nextAction = attachResponse.data.attributes.next_action;
      if (nextAction?.redirect?.url) {
        const authResult = await open3DSAuthentication(
          nextAction.redirect.url,
          returnUrl
        );

        dismissBrowser();

        console.log(
          '[PaymentFailed] Auth result:',
          authResult.type,
          'url' in authResult ? authResult.url : 'no url'
        );

        // Check if this was a successful redirect (user completed auth)
        // 'success' means the redirect URL was matched
        // If there's a URL in the result, the redirect completed
        if (
          authResult.type === 'success' ||
          ('url' in authResult && authResult.url)
        ) {
          // Payment auth completed - navigate to processing to verify
          router.replace(
            Routes.checkout.paymentProcessing({
              orderId: params.orderId,
              orderNumber: orderDetails.order_number,
              arrivalCode: orderDetails.arrival_code,
              paymentIntentId,
              total: orderDetails.total_amount?.toString(),
            })
          );
          return;
        }

        // User explicitly cancelled the payment auth flow
        // Note: We only show alert for explicit 'cancel', not 'dismiss'
        // 'dismiss' can occur when deep link navigates away (which means success)
        if (authResult.type === 'cancel') {
          Alert.alert(
            'Payment Cancelled',
            'You cancelled the payment. You can try again.',
            [{ text: 'OK' }]
          );
          return;
        }

        // For 'dismiss' or other cases:
        // - If payment succeeded, deep link already navigated user to success screen
        // - If payment failed, user is still here and can retry
        // - No need to navigate or show alert
        console.log(
          '[PaymentFailed] Auth dismissed - user may have been redirected via deep link'
        );
      }
    } catch (error: any) {
      console.error('[PaymentFailed] Payment retry failed:', error);
      Alert.alert(
        'Payment Error',
        error.response?.data?.message ||
          error.message ||
          'Failed to start payment process'
      );
    } finally {
      setRetrying(false);
    }
  };

  const handleGoBack = () => {
    // Navigate back to checkout to try again
    router.back();
  };

  const handleViewOrders = () => {
    router.replace(Routes.profile.orders.index);
  };

  /**
   * Handle "Change Payment Method" - restore order items to cart and navigate to checkout
   * with prefilled data so user can select a different payment method
   */
  const handleChangePaymentMethod = async () => {
    if (!params.orderId) {
      // No order - just go to checkout
      router.replace(Routes.checkout.index({ fromChangePaymentMethod: 'true' }));
      return;
    }

    try {
      setChangingPaymentMethod(true);
      console.log(
        '[PaymentFailed] Changing payment method for order:',
        params.orderId
      );

      // Fetch order details to get items and restore to cart
      const orderDetails = await getOrderById(params.orderId);

      if (orderDetails.items && orderDetails.items.length > 0) {
        // Restore items to cart
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
        console.log(
          '[PaymentFailed] Restored',
          orderDetails.items.length,
          'items to cart'
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
          prefillSpecialInstructions: orderDetails.special_instructions || undefined,
          fromChangePaymentMethod: 'true',
        })
      );
    } catch (error: any) {
      console.error('[PaymentFailed] Failed to change payment method:', error);
      Alert.alert(
        'Error',
        'Unable to change payment method. Please try again.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(Routes.checkout.index({ fromChangePaymentMethod: 'true' })),
          },
        ]
      );
    } finally {
      setChangingPaymentMethod(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: errorTitle,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <PageContainer padding={24}>
        <View style={styles.container}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${theme.error}15` },
            ]}
          >
            <Ionicons name="close-circle" size={80} color={theme.error} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {errorTitle}
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {params.errorMessage ||
              'Your payment could not be processed. Please try again.'}
          </Text>

          {/* Order Info - only show if order was created */}
          {orderCreated && params.orderNumber && (
            <View
              style={[styles.orderInfo, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>
                Order Number
              </Text>
              <Text style={[styles.orderNumber, { color: theme.text }]}>
                {params.orderNumber}
              </Text>
            </View>
          )}

          {/* Info message based on context */}
          <View
            style={[styles.infoBox, { backgroundColor: `${theme.info}10` }]}
          >
            <Ionicons name="information-circle" size={20} color={theme.info} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {orderCreated
                ? isCardError
                  ? 'Your card details need to be re-entered. Tap below to return to checkout.'
                  : 'You can retry payment or change to a different payment method.'
                : isCardError
                ? 'You can try a different card or switch to GCash/Maya.'
                : 'Please check your payment details and try again.'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {orderCreated ? (
              <>
                {/* For card errors: "Try Again" redirects to checkout (same as change payment) */}
                {/* For e-wallets: "Try Again" retries with same payment info */}
                <Pressable
                  style={[
                    styles.primaryButton,
                    { backgroundColor: theme.primary },
                    (retrying || changingPaymentMethod) && styles.disabledButton,
                  ]}
                  onPress={handleRetryPayment}
                  disabled={retrying || changingPaymentMethod}
                >
                  {(retrying || (isCardError && changingPaymentMethod)) ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={20} color="#FFF" />
                      <Text style={styles.primaryButtonText}>Try Again</Text>
                    </>
                  )}
                </Pressable>

                {/* Change Payment Method - only show for e-wallets (card "Try Again" already does this) */}
                {!isCardError && (
                  <Pressable
                    style={[
                      styles.secondaryButton,
                      { borderColor: theme.border },
                      changingPaymentMethod && styles.disabledButton,
                    ]}
                    onPress={handleChangePaymentMethod}
                    disabled={retrying || changingPaymentMethod}
                  >
                    {changingPaymentMethod ? (
                      <ActivityIndicator color={theme.text} size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name="swap-horizontal"
                          size={20}
                          color={theme.text}
                        />
                        <Text
                          style={[styles.secondaryButtonText, { color: theme.text }]}
                        >
                          Change Payment Method
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}

                {/* Go Back to Cart as tertiary option */}
                <Pressable
                  style={[
                    styles.secondaryButton,
                    { borderColor: theme.border },
                    goingToCart && styles.disabledButton,
                  ]}
                  onPress={handleGoToCart}
                  disabled={retrying || goingToCart || changingPaymentMethod}
                >
                  {goingToCart ? (
                    <ActivityIndicator color={theme.text} size="small" />
                  ) : (
                    <Text
                      style={[
                        styles.secondaryButtonText,
                        { color: theme.text },
                      ]}
                    >
                      Go Back to Cart
                    </Text>
                  )}
                </Pressable>
              </>
            ) : (
              <>
                {/* No order created - show Go Back as primary */}
                <Pressable
                  style={[
                    styles.primaryButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleGoBack}
                >
                  <Ionicons name="arrow-back" size={20} color="#FFF" />
                  <Text style={styles.primaryButtonText}>
                    {isCardError ? 'Try Different Card' : 'Try Again'}
                  </Text>
                </Pressable>

                {isCardError && (
                  <Pressable
                    style={[
                      styles.secondaryButton,
                      { borderColor: theme.border },
                    ]}
                    onPress={handleGoBack}
                  >
                    <Text
                      style={[
                        styles.secondaryButtonText,
                        { color: theme.text },
                      ]}
                    >
                      Switch to GCash/Maya
                    </Text>
                  </Pressable>
                )}
              </>
            )}

            {/* Always show View Orders option */}
            <Pressable style={styles.textButton} onPress={handleViewOrders}>
              <Text style={[styles.textButtonText, { color: theme.primary }]}>
                View My Orders
              </Text>
            </Pressable>
          </View>
        </View>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  orderInfo: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 32,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  textButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PaymentFailedScreen;
