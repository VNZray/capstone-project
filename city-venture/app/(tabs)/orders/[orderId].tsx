// See spec.md §4 - Order detail view with status timeline

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { getOrderById, cancelOrder } from '@/services/OrderService';
import type { Order, OrderStatus } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';

// See spec.md §5 - Order State Machine transitions
const ORDER_TIMELINE: OrderStatus[] = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
];

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING':
      return colors.warning;
    case 'ACCEPTED':
    case 'PREPARING':
      return colors.info;
    case 'READY_FOR_PICKUP':
    case 'PICKED_UP':
      return colors.success;
    case 'CANCELLED_BY_USER':
    case 'CANCELLED_BY_BUSINESS':
    case 'FAILED_PAYMENT':
      return colors.error;
    default:
      return colors.primary;
  }
};

const OrderDetailScreen = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h4, h1, body, bodySmall } = type;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  const loadOrderDetails = useCallback(async () => {
    if (!orderId) return;

    try {
      setError(null);
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
      console.log('[OrderDetail] Loaded order:', orderData);
    } catch (error: any) {
      console.error('[OrderDetail] Load failed:', error);
      setError(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  const handleCancelOrder = async () => {
    if (!order) return;

    // Check if order can be cancelled (within grace period & PENDING)
    if (order.status !== 'PENDING') {
      Alert.alert(
        'Cannot Cancel',
        'This order cannot be cancelled. Please contact the business for assistance.'
      );
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await cancelOrder(order.id);
              
              Alert.alert(
                'Order Cancelled',
                'Your order has been cancelled successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error: any) {
              console.error('[OrderDetail] Cancel failed:', error);
              Alert.alert(
                'Cancellation Failed',
                error.response?.data?.message || error.message || 'Failed to cancel order'
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Order Details' }} />
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
        <Stack.Screen options={{ title: 'Order Details' }} />
        <PageContainer>
          <View style={[styles.centerContainer, { backgroundColor: palette.bg }]}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={[{ fontSize: h4 }, { color: palette.text, marginTop: 16, textAlign: 'center' }]}>
              {error || 'Order not found'}
            </Text>
          </View>
        </PageContainer>
      </>
    );
  }

  const currentStatusIndex = ORDER_TIMELINE.indexOf(order.status);
  const isCancelled = order.status.startsWith('CANCELLED') || order.status === 'FAILED_PAYMENT';

  return (
    <>
      <Stack.Screen
        options={{
          title: order.order_number,
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
        }}
      />
      <PageContainer>
        <ScrollView
          style={[styles.container, { backgroundColor: palette.bg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badge */}
          <View style={[styles.statusSection, { backgroundColor: palette.card }]}>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
              <Text style={[{ fontSize: h4 }, { color: getStatusColor(order.status) }]}>
                {order.status.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>

          {/* Arrival Code (if ready for pickup) */}
          {order.status === 'READY_FOR_PICKUP' && (
            <View style={[styles.section, { backgroundColor: palette.card }]}>
              <Text style={[{ fontSize: body }, { color: palette.subText, textAlign: 'center', marginBottom: 12 }]}>
                Your Arrival Code
              </Text>
              <View style={[styles.arrivalCodeBox, { backgroundColor: palette.bg, borderColor: colors.primary }]}>
                <Text style={[{ fontSize: h1 }, { color: colors.primary, letterSpacing: 8 }]}>
                  {order.arrival_code}
                </Text>
              </View>
              <Text style={[{ fontSize: bodySmall }, { color: palette.subText, textAlign: 'center', marginTop: 8 }]}>
                Show this code to staff when picking up
              </Text>
            </View>
          )}

          {/* Timeline (if not cancelled) */}
          {!isCancelled && (
            <View style={[styles.section, { backgroundColor: palette.card }]}>
              <Text style={[{ fontSize: h4 }, { color: palette.text, marginBottom: 16 }]}>
                Order Progress
              </Text>
              {ORDER_TIMELINE.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                
                return (
                  <View key={status} style={styles.timelineItem}>
                    <View style={styles.timelineIndicator}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: isCompleted ? colors.success : palette.border,
                            borderColor: isCurrent ? colors.success : palette.border,
                            borderWidth: isCurrent ? 3 : 0,
                          },
                        ]}
                      />
                      {index < ORDER_TIMELINE.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: isCompleted ? colors.success : palette.border },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        { fontSize: body },
                        {
                          color: isCompleted ? palette.text : palette.subText,
                          fontWeight: isCurrent ? '600' : '400',
                        },
                      ]}
                    >
                      {status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Order Details */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <Text style={[{ fontSize: h4 }, { color: palette.text, marginBottom: 16 }]}>
              Order Information
            </Text>
            
            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Order Number</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>{order.order_number}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Placed On</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>
                {new Date(order.created_at).toLocaleDateString()} at{' '}
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Pickup Time</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>
                {new Date(order.pickup_datetime).toLocaleString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Payment Method</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>
                {order.payment_method.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Payment Status</Text>
              <Text style={[{ fontSize: body }, { color: getStatusColor(order.status) }]}>
                {order.payment_status}
              </Text>
            </View>

            {order.special_instructions && (
              <View style={styles.detailRow}>
                <Text style={[{ fontSize: body }, { color: palette.subText }]}>Special Instructions</Text>
                <Text style={[{ fontSize: body }, { color: palette.text, flex: 1, textAlign: 'right' }]}>
                  {order.special_instructions}
                </Text>
              </View>
            )}
          </View>

          {/* Order Items */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <Text style={[{ fontSize: h4 }, { color: palette.text, marginBottom: 16 }]}>
              Items ({order.items?.length || 0})
            </Text>
            {order.items?.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: body }, { color: palette.text }]}>
                    {item.quantity}x {item.product_name || 'Product'}
                  </Text>
                  {item.special_requests && (
                    <Text style={[{ fontSize: bodySmall }, { color: palette.subText, marginTop: 2 }]}>
                      Note: {item.special_requests}
                    </Text>
                  )}
                </View>
                <Text style={[{ fontSize: body }, { color: palette.text }]}>
                  ₱{(item.total_price || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Order Summary */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <View style={styles.summaryRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Subtotal</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>₱{(order.subtotal || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Discount</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>-₱{(order.discount_amount || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Tax</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>₱{(order.tax_amount || 0).toFixed(2)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: palette.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[{ fontSize: h4 }, { color: palette.text }]}>Total</Text>
              <Text style={[{ fontSize: h4 }, { color: colors.primary }]}>₱{(order.total_amount || 0).toFixed(2)}</Text>
            </View>
          </View>

          {/* Cancel Button (if PENDING) */}
          {order.status === 'PENDING' && (
            <Pressable
              style={[styles.cancelButton, { backgroundColor: palette.card, borderColor: colors.error }]}
              onPress={handleCancelOrder}
              disabled={cancelling}
            >
              <Text style={[{ fontSize: body, fontWeight: '600' }, { color: colors.error }]}>
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSection: {
    padding: 20,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  arrivalCodeBox: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineLine: {
    width: 2,
    height: 30,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cancelButton: {
    margin: 16,
    marginTop: 0,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
});

export default OrderDetailScreen;
