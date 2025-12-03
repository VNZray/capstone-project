/**
 * Payment Success Screen
 * Displayed when user returns from PayMongo checkout after successful payment
 * Polls backend to verify payment completion
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { getOrderById } from '@/services/OrderService';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '@/services/api';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const PaymentSuccessScreen = () => {
  const params = useLocalSearchParams<{ orderId: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h1, h2, h4, body, bodySmall } = type;

  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Animations
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
    successBg: isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5',
    successText: '#10B981',
  };

  // Socket listener for real-time payment updates
  useEffect(() => {
    const setupSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return;

        const socketUrl = API_URL.replace('/api', '');
        const socket = io(socketUrl, {
          auth: { token },
          transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('payment:updated', (data: any) => {
          if (
            data.order_id === params.orderId &&
            data.status?.toLowerCase() === 'paid'
          ) {
            setVerifying(false);
          }
        });

        socket.on('order:updated', (data: any) => {
          if (
            data.id === params.orderId &&
            data.payment_status?.toLowerCase() === 'paid'
          ) {
            setVerifying(false);
          }
        });
      } catch (err) {
        console.error('[PaymentSuccess] Socket setup error:', err);
      }
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [params.orderId]);

  useEffect(() => {
    if (!verifying && !error) {
      // Trigger success animations
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 800 });
      translateY.value = withSpring(0, { damping: 15 });
    }
  }, [verifying, error]);

  const verifyPayment = useCallback(async () => {
    try {
      setVerifying(true);
      setError(null);

      // Immediate check
      try {
        const immediateCheck = await getOrderById(params.orderId);
        if (immediateCheck.payment_status?.toLowerCase() === 'paid') {
          setVerifying(false);
          return;
        }
      } catch (_) {
        // Continue to polling
      }

      // Poll for payment confirmation
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        try {
          const order = await getOrderById(params.orderId);

          if (order.payment_status?.toLowerCase() === 'paid') {
            setVerifying(false);
            return;
          }

          if (order.payment_status?.toLowerCase() === 'failed') {
            setError('Payment failed. Please try again.');
            setVerifying(false);
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;
        } catch (err: any) {
          if (err.response?.status === 404 || err.response?.status === 403) {
            setError('Order not found or access denied.');
            setVerifying(false);
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;
        }
      }

      // Final check
      try {
        const finalCheck = await getOrderById(params.orderId);
        if (finalCheck.payment_status?.toLowerCase() === 'paid') {
          setVerifying(false);
          return;
        }
      } catch (_) {}

      setError(
        'Payment verification timed out. Please check your order history.'
      );
      setVerifying(false);
    } catch (err: any) {
      setError(err.message || 'Failed to verify payment');
      setVerifying(false);
    }
  }, [params.orderId]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  const handleViewOrder = () => {
    router.replace(Routes.profile.orders.detail(params.orderId));
  };

  const handleBackToHome = () => {
    router.replace(Routes.tabs.home);
  };

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
          {verifying ? (
            <View style={styles.centerContent}>
              <View
                style={[styles.loadingCircle, { borderColor: colors.primary }]}
              >
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
              <Text
                style={[{ fontSize: h4, color: palette.text, marginTop: 24 }]}
              >
                Verifying Payment...
              </Text>
              <Text
                style={[
                  { fontSize: body, color: palette.subText, marginTop: 8 },
                ]}
              >
                Please wait a moment
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${colors.error}20` },
                ]}
              >
                <Ionicons name="alert-circle" size={64} color={colors.error} />
              </View>
              <Text
                style={[
                  {
                    fontSize: h2,
                    color: palette.text,
                    marginTop: 24,
                    textAlign: 'center',
                  },
                ]}
              >
                Verification Issue
              </Text>
              <Text
                style={[
                  {
                    fontSize: body,
                    color: palette.subText,
                    textAlign: 'center',
                    marginTop: 8,
                    paddingHorizontal: 32,
                  },
                ]}
              >
                {error}
              </Text>
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.primaryButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={verifyPayment}
                >
                  <Text style={styles.buttonText}>Retry Verification</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.secondaryButton,
                    { borderColor: palette.border },
                  ]}
                  onPress={handleBackToHome}
                >
                  <Text
                    style={[
                      styles.secondaryButtonText,
                      { color: palette.text },
                    ]}
                  >
                    Back to Home
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.successContent}>
              <Animated.View
                style={[styles.successIconWrapper, animatedIconStyle]}
              >
                <LinearGradient
                  colors={[colors.success, '#34D399']}
                  style={styles.gradientIcon}
                >
                  <Ionicons name="checkmark" size={64} color="#FFF" />
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
                      textAlign: 'center',
                      marginBottom: 8,
                    },
                  ]}
                >
                  Order Placed!
                </Text>
                <Text
                  style={[
                    {
                      fontSize: body,
                      color: palette.subText,
                      textAlign: 'center',
                      marginBottom: 32,
                    },
                  ]}
                >
                  Your order has been successfully placed and is being
                  processed.
                </Text>

                <View
                  style={[
                    styles.orderCard,
                    {
                      backgroundColor: palette.card,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <View style={styles.cardRow}>
                    <Text style={[{ fontSize: body, color: palette.subText }]}>
                      Order ID
                    </Text>
                    <Text
                      style={[
                        {
                          fontSize: body,
                          color: palette.text,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      #{params.orderId?.slice(0, 8).toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: palette.border },
                    ]}
                  />
                  <View style={styles.cardRow}>
                    <Text style={[{ fontSize: body, color: palette.subText }]}>
                      Amount Paid
                    </Text>
                    <View style={styles.statusBadge}>
                      <Text
                        style={[
                          {
                            fontSize: bodySmall,
                            color: colors.success,
                            fontWeight: '600',
                          },
                        ]}
                      >
                        PAID
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: palette.border },
                    ]}
                  />
                  <View style={styles.cardRow}>
                    <Text style={[{ fontSize: body, color: palette.subText }]}>
                      Estimated Time
                    </Text>
                    <Text
                      style={[
                        {
                          fontSize: body,
                          color: palette.text,
                          fontWeight: '600',
                        },
                      ]}
                    >
                      15-20 mins
                    </Text>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <Pressable
                    style={[
                      styles.primaryButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleViewOrder}
                  >
                    <Text style={styles.buttonText}>Track Order</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.secondaryButton,
                      { borderColor: palette.border },
                    ]}
                    onPress={handleBackToHome}
                  >
                    <Text
                      style={[
                        styles.secondaryButtonText,
                        { color: palette.text },
                      ]}
                    >
                      Continue Shopping
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
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
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  successContent: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    marginTop: -40,
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconWrapper: {
    marginBottom: 24,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  orderCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 4,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentSuccessScreen;
