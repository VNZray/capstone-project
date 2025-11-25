// See spec.md §4 - Arrival code screen for pickup verification
// Large, scannable arrival code display for easy business verification

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { getOrderById } from '@/services/OrderService';
import type { Order } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';

const OrderPickupScreen = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h1, h2, h4, body, bodySmall } = type;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      } catch (error: any) {
        console.error('[OrderPickup] Load failed:', error);
        setError(error.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Pickup Code' }} />
        <PageContainer>
          <View style={[styles.centerContainer, { backgroundColor: palette.bg }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </PageContainer>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Stack.Screen options={{ title: 'Pickup Code' }} />
        <PageContainer>
          <View style={[styles.centerContainer, { backgroundColor: palette.bg }]}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={[{ fontSize: h4 }, { color: palette.text, marginTop: 16 }]}>
              {error || 'Order not found'}
            </Text>
          </View>
        </PageContainer>
      </>
    );
  }

  // Check if order is ready for pickup
  const isReady = order.status === 'READY_FOR_PICKUP';
  const isPending = order.status === 'PENDING' || order.status === 'ACCEPTED' || order.status === 'PREPARING';
  const isCompleted = order.status === 'PICKED_UP';
  const isCancelled = order.status.startsWith('CANCELLED') || order.status === 'FAILED_PAYMENT';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Pickup Code',
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
        }}
      />
      <PageContainer>
        <View style={[styles.container, { backgroundColor: palette.bg }]}>
          {/* Status Icon */}
          {isReady && (
            <View style={[styles.iconContainer, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="checkmark-done" size={60} color={colors.success} />
            </View>
          )}
          {isPending && (
            <View style={[styles.iconContainer, { backgroundColor: `${colors.warning}20` }]}>
              <Ionicons name="time-outline" size={60} color={colors.warning} />
            </View>
          )}
          {isCompleted && (
            <View style={[styles.iconContainer, { backgroundColor: `${colors.success}20` }]}>
              <Ionicons name="checkmark-circle" size={60} color={colors.success} />
            </View>
          )}
          {isCancelled && (
            <View style={[styles.iconContainer, { backgroundColor: `${colors.error}20` }]}>
              <Ionicons name="close-circle" size={60} color={colors.error} />
            </View>
          )}

          {/* Status Message */}
          <Text style={[{ fontSize: h2 }, { color: palette.text, textAlign: 'center', marginTop: 24 }]}>
            {isReady && 'Ready for Pickup!'}
            {isPending && 'Order Being Prepared'}
            {isCompleted && 'Order Completed'}
            {isCancelled && 'Order Cancelled'}
          </Text>

          <Text style={[{ fontSize: body }, { color: palette.subText, textAlign: 'center', marginTop: 8 }]}>
            {isReady && 'Show this code to staff'}
            {isPending && 'Your code will be active when ready'}
            {isCompleted && 'Thank you for your order'}
            {isCancelled && 'This order has been cancelled'}
          </Text>

          {/* Main Arrival Code Card */}
          <View
            style={[
              styles.codeCard,
              {
                backgroundColor: palette.card,
                borderColor: isReady ? colors.primary : palette.border,
                opacity: isReady ? 1 : 0.6,
              },
            ]}
          >
            {/* Order Number */}
            <Text style={[{ fontSize: body }, { color: palette.subText, textAlign: 'center' }]}>
              Order {order.order_number}
            </Text>

            {/* Arrival Code Display */}
            <View style={[styles.codeBox, { backgroundColor: palette.bg }]}>
              <Text style={[{ fontSize: bodySmall }, { color: palette.subText, marginBottom: 12 }]}>
                ARRIVAL CODE
              </Text>
              <Text
                style={[
                  { fontSize: h1 * 1.5 },
                  {
                    color: isReady ? colors.primary : palette.subText,
                    letterSpacing: 16,
                    fontWeight: '700',
                  },
                ]}
              >
                {order.arrival_code}
              </Text>
            </View>
          </View>

          {/* Order Details Summary */}
          <View style={[styles.detailsCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Business</Text>
              <Text style={[{ fontSize: body }, { color: palette.text, fontWeight: '600' }]}>
                {order.business_name || 'Shop'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Pickup Time</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>
                {new Date(order.pickup_datetime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Total Amount</Text>
              <Text style={[{ fontSize: h4 }, { color: colors.primary }]}>
                ₱{(order.total_amount || 0).toFixed(2)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Payment Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      order.payment_status === 'PAID' ? `${colors.success}20` : `${colors.warning}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    { fontSize: bodySmall },
                    { color: order.payment_status === 'PAID' ? colors.success : colors.warning },
                  ]}
                >
                  {order.payment_status}
                </Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          {isReady && (
            <View style={[styles.instructionsCard, { backgroundColor: `${colors.info}15`, borderColor: colors.info }]}>
              <Ionicons name="information-circle-outline" size={24} color={colors.info} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[{ fontSize: body }, { color: palette.text, fontWeight: '600', marginBottom: 4 }]}>
                  Pickup Instructions
                </Text>
                <Text style={[{ fontSize: bodySmall }, { color: palette.text }]}>
                  1. Go to the shop counter{'\n'}
                  2. Show this screen to staff{'\n'}
                  3. Staff will verify your code{'\n'}
                  4. Collect your order and enjoy!
                </Text>
              </View>
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
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  codeCard: {
    marginTop: 32,
    padding: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
  },
  codeBox: {
    marginTop: 20,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  detailsCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  instructionsCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
  },
});

export default OrderPickupScreen;
