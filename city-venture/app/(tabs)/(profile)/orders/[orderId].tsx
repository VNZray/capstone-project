// See spec.md §4 - Tourist can track orders
// See spec.md §5 - Order Status enums

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { getOrderById, cancelOrder } from '@/services/OrderService';
import type { Order, OrderStatus } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';

const ORDER_TIMELINE: OrderStatus[] = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
];

const getStatusLabel = (status: OrderStatus): string => {
  return status.replace(/_/g, ' ');
};

const OrderDetailScreen = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h4, body, bodySmall } = type;

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
    primary: colors.primary,
  };

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error('[OrderDetail] Fetch error:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            setCancelling(true);
            await cancelOrder(order.id);
            Alert.alert('Success', 'Order cancelled successfully');
            fetchOrder();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to cancel order');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@cityventure.com');
  };

  const renderTimeline = () => {
    if (!order) return null;

    const currentStatusIndex = ORDER_TIMELINE.indexOf(
      order.status as OrderStatus
    );
    const isCancelled =
      order.status.includes('CANCELLED') || order.status === 'FAILED_PAYMENT';

    if (isCancelled) {
      return (
        <View
          style={[
            styles.cancelledBanner,
            { backgroundColor: colors.error + '15', borderColor: colors.error },
          ]}
        >
          <Ionicons name="alert-circle" size={24} color={colors.error} />
          <Text
            style={[
              styles.cancelledText,
              { color: colors.error, fontSize: body },
            ]}
          >
            Order {getStatusLabel(order.status)}
          </Text>
        </View>
      );
    }

    if (currentStatusIndex === -1) return null;

    return (
      <View style={styles.timelineContainer}>
        <View style={styles.progressBarContainer}>
          {ORDER_TIMELINE.map((status, index) => {
            const isActive = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;

            let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';
            if (status === 'PENDING') iconName = 'time';
            if (status === 'ACCEPTED') iconName = 'checkmark-circle';
            if (status === 'PREPARING') iconName = 'restaurant';
            if (status === 'READY_FOR_PICKUP') iconName = 'bag-handle';
            if (status === 'PICKED_UP') iconName = 'home';

            return (
              <View key={status} style={styles.progressStep}>
                <View
                  style={[
                    styles.progressIcon,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : palette.border,
                    },
                    isCurrent && {
                      transform: [{ scale: 1.2 }],
                      borderWidth: 2,
                      borderColor: palette.bg,
                    },
                  ]}
                >
                  <Ionicons
                    name={iconName}
                    size={14}
                    color={isActive ? '#FFF' : palette.subText}
                  />
                </View>
                {index < ORDER_TIMELINE.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      {
                        backgroundColor:
                          index < currentStatusIndex
                            ? colors.primary
                            : palette.border,
                      },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.progressLabel,
                    {
                      color: isActive ? palette.text : palette.subText,
                      fontSize: 10,
                      fontWeight: isActive ? '600' : '400',
                    },
                  ]}
                >
                  {index === currentStatusIndex ? getStatusLabel(status) : ''}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centerContainer, { backgroundColor: palette.bg }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </PageContainer>
    );
  }

  if (error || !order) {
    return (
      <PageContainer>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.centerContainer, { backgroundColor: palette.bg }]}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.error}
          />
          <Text style={[{ fontSize: h4, color: palette.text, marginTop: 16 }]}>
            {error || 'Order not found'}
          </Text>
          <Pressable
            style={[
              styles.backButton,
              { backgroundColor: palette.card, borderColor: palette.border },
            ]}
            onPress={() => router.replace('/(tabs)/(profile)/orders')}
          >
            <Text style={{ color: palette.text }}>Go Back</Text>
          </Pressable>
        </View>
      </PageContainer>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Order #${order.order_number}`,
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable
              onPress={() => router.replace('/(tabs)/(profile)/orders')}
              style={{ paddingRight: 16 }}
            >
              <Ionicons name="arrow-back" size={24} color={palette.text} />
            </Pressable>
          ),
        }}
      />
      <PageContainer>
        <ScrollView
          style={[styles.container, { backgroundColor: palette.bg }]}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Status & Timeline */}
          <View
            style={[
              styles.section,
              { backgroundColor: palette.card, marginTop: 16 },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { fontSize: h4, color: palette.text },
              ]}
            >
              Order Status
            </Text>
            {renderTimeline()}
            <Text
              style={[
                styles.estimatedTime,
                { fontSize: bodySmall, color: palette.subText },
              ]}
            >
              Placed on {new Date(order.created_at).toLocaleString()}
            </Text>
          </View>

          {/* Business Info */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <View style={styles.businessHeader}>
              <View
                style={[
                  styles.businessIcon,
                  { backgroundColor: isDark ? '#2A2F36' : '#F3F4F6' },
                ]}
              >
                <Ionicons name="storefront" size={24} color={palette.subText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    { fontSize: body, fontWeight: '700', color: palette.text },
                  ]}
                >
                  {order.business_name || 'Business Name'}
                </Text>
                <Text style={[{ fontSize: bodySmall, color: palette.subText }]}>
                  View Store
                </Text>
              </View>
              <Pressable
                onPress={handleContactSupport}
                style={[styles.iconButton, { backgroundColor: palette.bg }]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          </View>

          {/* Items */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <Text
              style={[
                styles.sectionTitle,
                { fontSize: h4, color: palette.text },
              ]}
            >
              Your Items
            </Text>
            {order.items?.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.itemRow,
                  index < (order.items?.length || 0) - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: palette.border,
                  },
                ]}
              >
                <View
                  style={[styles.itemQuantity, { backgroundColor: palette.bg }]}
                >
                  <Text style={{ fontWeight: '600', color: palette.text }}>
                    {item.quantity}x
                  </Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[{ fontSize: body, color: palette.text }]}>
                    {item.product_name}
                  </Text>
                </View>
                <Text
                  style={[
                    { fontSize: body, fontWeight: '600', color: palette.text },
                  ]}
                >
                  ₱{item.total_price.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Payment Summary */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <Text
              style={[
                styles.sectionTitle,
                { fontSize: h4, color: palette.text },
              ]}
            >
              Payment Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: body, color: palette.subText }}>
                Subtotal
              </Text>
              <Text style={{ fontSize: body, color: palette.text }}>
                ₱{(order.total_amount || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ fontSize: body, color: palette.subText }}>
                Delivery Fee
              </Text>
              <Text style={{ fontSize: body, color: palette.text }}>₱0.00</Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: palette.border }]}
            />
            <View style={styles.summaryRow}>
              <Text
                style={{ fontSize: h4, fontWeight: '700', color: palette.text }}
              >
                Total
              </Text>
              <Text
                style={{
                  fontSize: h4,
                  fontWeight: '700',
                  color: colors.primary,
                }}
              >
                ₱{(order.total_amount || 0).toFixed(2)}
              </Text>
            </View>
            <View
              style={[styles.paymentMethod, { backgroundColor: palette.bg }]}
            >
              <Ionicons name="card-outline" size={20} color={palette.subText} />
              <Text style={{ marginLeft: 8, color: palette.subText }}>
                Paid with {order.payment_method?.replace(/_/g, ' ') || 'Card'}
              </Text>
            </View>
          </View>

          {/* Actions */}
          {order.status === 'PENDING' && (
            <Pressable
              style={[styles.cancelButton, { borderColor: colors.error }]}
              onPress={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator color={colors.error} />
              ) : (
                <Text
                  style={{
                    color: colors.error,
                    fontWeight: '600',
                    fontSize: body,
                  }}
                >
                  Cancel Order
                </Text>
              )}
            </Pressable>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 16,
  },
  timelineContainer: {
    marginVertical: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
    height: 60,
  },
  progressStep: {
    alignItems: 'center',
    width: 60,
    position: 'relative',
  },
  progressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  progressLine: {
    position: 'absolute',
    top: 15,
    left: 30, // Center of icon
    width: '100%', // Connect to next
    height: 2,
    zIndex: 1,
  },
  progressLabel: {
    marginTop: 4,
    textAlign: 'center',
    width: 80,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  cancelledText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  estimatedTime: {
    textAlign: 'center',
    marginTop: 8,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemQuantity: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  cancelButton: {
    width: '100%',
    padding: 16,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  backButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
});

export default OrderDetailScreen;
