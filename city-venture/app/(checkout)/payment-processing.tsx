import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import PageContainer from '@/components/PageContainer';
import { pollPaymentIntentStatus } from '@/services/PaymentIntentService';
import { Ionicons } from '@expo/vector-icons';

/**
 * Payment Processing Screen
 * Shown after user returns from e-wallet authorization
 * Polls payment status and navigates to appropriate screen
 */
const PaymentProcessingScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors];

  const params = useLocalSearchParams<{
    orderId: string;
    orderNumber: string;
    arrivalCode: string;
    paymentIntentId: string;
    total: string;
  }>();

  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>(
    'processing'
  );
  const [statusMessage, setStatusMessage] = useState(
    'Verifying your payment...'
  );
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Spinner animation
  useEffect(() => {
    if (status === 'processing') {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [status, spinValue]);

  // Success pulse animation
  useEffect(() => {
    if (status === 'success') {
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [status, scaleValue]);

  // Poll payment status
  useEffect(() => {
    let isMounted = true;

    const checkPaymentStatus = async () => {
      if (!params.paymentIntentId) {
        console.error('[PaymentProcessing] No payment intent ID');
        setStatus('failed');
        setStatusMessage('Missing payment information');
        return;
      }

      try {
        setStatusMessage('Verifying your payment...');

        const result = await pollPaymentIntentStatus(
          params.paymentIntentId,
          30, // Max 30 attempts (60 seconds)
          2000 // 2 second interval
        );

        if (!isMounted) return;

        const paymentStatus = result.data.status;
        const orderPaymentStatus = result.data.order_payment_status;

        console.log(
          '[PaymentProcessing] Final status:',
          paymentStatus,
          orderPaymentStatus
        );

        if (paymentStatus === 'succeeded' || orderPaymentStatus === 'paid') {
          setStatus('success');
          setStatusMessage('Payment successful!');

          // Navigate to confirmation after short delay
          setTimeout(() => {
            if (isMounted) {
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
            }
          }, 1500);
        } else if (result.data.last_payment_error) {
          setStatus('failed');
          setStatusMessage(
            result.data.last_payment_error.message ||
              'Payment was not completed'
          );

          // Navigate to failure screen after delay
          setTimeout(() => {
            if (isMounted) {
              router.replace(
                Routes.checkout.paymentFailed({
                  orderId: params.orderId,
                  orderNumber: params.orderNumber,
                  errorMessage:
                    result.data.last_payment_error?.message || 'Payment failed',
                })
              );
            }
          }, 2000);
        } else {
          // Still processing or awaiting_payment_method (user may have cancelled)
          setStatus('failed');
          setStatusMessage(
            'Payment was not completed. You can retry from your orders.'
          );

          setTimeout(() => {
            if (isMounted) {
              router.replace(
                Routes.checkout.paymentCancel({
                  orderId: params.orderId,
                })
              );
            }
          }, 2000);
        }
      } catch (error: any) {
        console.error('[PaymentProcessing] Error:', error);

        if (!isMounted) return;

        setStatus('failed');
        setStatusMessage(
          'Could not verify payment status. Please check your orders.'
        );

        setTimeout(() => {
          if (isMounted) {
            router.replace(
              Routes.checkout.orderConfirmation({
                orderId: params.orderId,
                orderNumber: params.orderNumber,
                arrivalCode: params.arrivalCode,
                total: params.total,
                paymentMethod: 'paymongo',
                paymentPending: 'true',
              })
            );
          }
        }, 2000);
      }
    };

    // Start checking after a short delay (give webhook time to process)
    const timeoutId = setTimeout(checkPaymentStatus, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [
    params.paymentIntentId,
    params.orderId,
    params.orderNumber,
    params.arrivalCode,
    params.total,
  ]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Processing Payment',
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
            style={[styles.iconContainer, { backgroundColor: theme.surface }]}
          >
            {status === 'processing' && (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Ionicons name="sync" size={64} color={theme.primary} />
              </Animated.View>
            )}
            {status === 'success' && (
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <Ionicons
                  name="checkmark-circle"
                  size={80}
                  color={theme.success}
                />
              </Animated.View>
            )}
            {status === 'failed' && (
              <Ionicons name="close-circle" size={80} color={theme.error} />
            )}
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {status === 'processing' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'failed' && 'Payment Issue'}
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {statusMessage}
          </Text>

          {status === 'processing' && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={theme.primary} size="small" />
              <Text
                style={[styles.loadingText, { color: theme.textSecondary }]}
              >
                Please wait...
              </Text>
            </View>
          )}

          {params.orderNumber && (
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
        </View>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  orderInfo: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default PaymentProcessingScreen;
