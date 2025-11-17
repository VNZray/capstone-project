/**
 * Payment Success Screen
 * Displayed when user returns from PayMongo checkout after successful payment
 * Polls backend to verify payment completion
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { getOrderById } from '@/services/OrderService';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/services/api';

const PaymentSuccessScreen = () => {
  const params = useLocalSearchParams<{ orderId: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h2, body, bodySmall } = type;

  const [verifying, setVerifying] = useState(true);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  // Socket listener for real-time payment updates
  useEffect(() => {
    const setupSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          console.log('[PaymentSuccess] No auth token, skipping socket setup');
          return;
        }

        const socketUrl = API_URL.replace('/api', '');
        console.log('[PaymentSuccess] Connecting to socket:', socketUrl);

        const socket = io(socketUrl, {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('[PaymentSuccess] Socket connected');
        });

        // Listen for payment updates
        socket.on('payment:updated', (data: any) => {
          console.log('[PaymentSuccess] Payment updated via socket:', data);
          if (data.order_id === params.orderId && data.status?.toLowerCase() === 'paid') {
            console.log('[PaymentSuccess] Payment confirmed via socket!');
            setPaymentStatus('paid');
            setVerifying(false);
          }
        });

        // Listen for order updates (payment_status change)
        socket.on('order:updated', (data: any) => {
          console.log('[PaymentSuccess] Order updated via socket:', data);
          if (data.id === params.orderId && data.payment_status?.toLowerCase() === 'paid') {
            console.log('[PaymentSuccess] Payment confirmed via socket (order update)!');
            setOrderStatus(data.status);
            setPaymentStatus(data.payment_status);
            setVerifying(false);
          }
        });

        socket.on('connect_error', (err: any) => {
          console.error('[PaymentSuccess] Socket connection error:', err);
        });

      } catch (err) {
        console.error('[PaymentSuccess] Socket setup error:', err);
      }
    };

    setupSocket();

    // Cleanup
    return () => {
      if (socketRef.current) {
        console.log('[PaymentSuccess] Disconnecting socket');
        socketRef.current.disconnect();
      }
    };
  }, [params.orderId]);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      setError(null);
      
      console.log('[PaymentSuccess] Starting verification for order:', params.orderId);
      
      // Immediate check first (order might already be paid)
      try {
        const immediateCheck = await getOrderById(params.orderId);
        if (immediateCheck.payment_status?.toLowerCase() === 'paid') {
          console.log('[PaymentSuccess] Payment already confirmed (immediate check)');
          setOrderStatus(immediateCheck.status);
          setPaymentStatus(immediateCheck.payment_status);
          setVerifying(false);
          return;
        }
      } catch (err) {
        console.log('[PaymentSuccess] Immediate check failed, starting polling...');
      }
      
      // Poll for payment confirmation (max 60 seconds for webhook processing)
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts * 2s = 60s
      
      while (attempts < maxAttempts) {
        try {
          const order = await getOrderById(params.orderId);
          
          // Check if payment is confirmed (case-insensitive)
          if (order.payment_status?.toLowerCase() === 'paid') {
            console.log(`[PaymentSuccess] Payment confirmed after ${attempts + 1} attempts`);
            setOrderStatus(order.status);
            setPaymentStatus(order.payment_status);
            setVerifying(false);
            return;
          }
          
          // Check if payment failed
          if (order.payment_status?.toLowerCase() === 'failed') {
            console.log('[PaymentSuccess] Payment failed');
            setError('Payment failed. Please try again or contact support.');
            setVerifying(false);
            return;
          }
          
          // Still pending, continue polling
          console.log(`[PaymentSuccess] Attempt ${attempts + 1}/${maxAttempts}: Payment status = ${order.payment_status}`);
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        } catch (err: any) {
          console.error('[PaymentSuccess] Polling error:', err);
          
          // If 404 or 403, stop polling
          if (err.response?.status === 404 || err.response?.status === 403) {
            setError('Order not found or access denied.');
            setVerifying(false);
            return;
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }
      }
      
      // Timeout after 60s - check one final time
      try {
        const finalCheck = await getOrderById(params.orderId);
        if (finalCheck.payment_status?.toLowerCase() === 'paid') {
          console.log('[PaymentSuccess] Payment confirmed on final check');
          setOrderStatus(finalCheck.status);
          setPaymentStatus(finalCheck.payment_status);
          setVerifying(false);
          return;
        }
      } catch (err) {
        console.error('[PaymentSuccess] Final check failed:', err);
      }
      
      // Still not confirmed - show timeout error
      console.log('[PaymentSuccess] Verification timeout - payment still pending');
      setError('Payment verification is taking longer than expected. Please check your order details to confirm payment status.');
      setVerifying(false);
    } catch (err: any) {
      console.error('[PaymentSuccess] Verification failed:', err);
      setError(err.message || 'Failed to verify payment');
      setVerifying(false);
    }
  };

  const handleViewOrder = () => {
    router.replace({
      pathname: '/(tabs)/orders/[orderId]',
      params: { orderId: params.orderId },
    } as never);
  };

  const handleBackToHome = () => {
    router.replace('/(tabs)/(home)' as never);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Payment Status',
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
          headerLeft: () => null,
        }}
      />
      <PageContainer>
        <View style={[styles.container, { backgroundColor: palette.bg }]}>
          {verifying ? (
            <>
              {/* Verifying State */}
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>

              <Text style={[{ fontSize: h2 }, { color: palette.text, textAlign: 'center', marginTop: 24 }]}>
                Verifying Payment
              </Text>

              <Text style={[{ fontSize: body }, { color: palette.subText, textAlign: 'center', marginTop: 8 }]}>
                Please wait while we confirm your payment...
              </Text>
            </>
          ) : error ? (
            <>
              {/* Error State */}
              <View style={[styles.iconContainer, { backgroundColor: `${colors.warning}20` }]}>
                <Ionicons name="time-outline" size={80} color={colors.warning} />
              </View>

              <Text style={[{ fontSize: h2 }, { color: palette.text, textAlign: 'center', marginTop: 24 }]}>
                Verification Pending
              </Text>

              <Text style={[{ fontSize: body }, { color: palette.subText, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }]}>
                {error}
              </Text>

              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={verifyPayment}
                >
                  <Text style={[{ fontSize: body, fontWeight: '600' }, { color: '#FFF' }]}>
                    Retry Verification
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.button, { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 }]}
                  onPress={handleViewOrder}
                >
                  <Text style={[{ fontSize: body, fontWeight: '600' }, { color: palette.text }]}>
                    View Order Details
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.button, { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 }]}
                  onPress={handleBackToHome}
                >
                  <Text style={[{ fontSize: body, fontWeight: '600' }, { color: palette.text }]}>
                    Back to Home
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              {/* Success State */}
              <View style={[styles.iconContainer, { backgroundColor: `${colors.success}20` }]}>
                <Ionicons name="checkmark-circle" size={80} color={colors.success} />
              </View>

              <Text style={[{ fontSize: h2 }, { color: palette.text, textAlign: 'center', marginTop: 24 }]}>
                Payment Successful!
              </Text>

              <Text style={[{ fontSize: body }, { color: palette.subText, textAlign: 'center', marginTop: 8 }]}>
                Your payment has been confirmed
              </Text>

              {/* Payment Info */}
              <View style={[styles.infoCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <View style={styles.infoRow}>
                  <Ionicons name="receipt-outline" size={20} color={palette.subText} />
                  <Text style={[{ fontSize: bodySmall }, { color: palette.subText, marginLeft: 8 }]}>
                    Order Status
                  </Text>
                  <Text style={[{ fontSize: body }, { color: palette.text, fontWeight: '600', marginLeft: 'auto' }]}>
                    {orderStatus?.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={20} color={palette.subText} />
                  <Text style={[{ fontSize: bodySmall }, { color: palette.subText, marginLeft: 8 }]}>
                    Payment Status
                  </Text>
                  <Text style={[{ fontSize: body }, { color: colors.success, fontWeight: '600', marginLeft: 'auto' }]}>
                    {paymentStatus?.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Pressable
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleViewOrder}
                >
                  <Text style={[{ fontSize: body, fontWeight: '600' }, { color: '#FFF' }]}>
                    View Order Details
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.button, { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 }]}
                  onPress={handleBackToHome}
                >
                  <Text style={[{ fontSize: body, fontWeight: '600' }, { color: palette.text }]}>
                    Back to Home
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  infoCard: {
    marginTop: 32,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 32,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
});

export default PaymentSuccessScreen;
