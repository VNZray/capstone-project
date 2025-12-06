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
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import PageContainer from '@/components/PageContainer';
import { getOrderById, cancelOrder } from '@/services/OrderService';
import type { Order, OrderStatus } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '@/components/header/AppHeader';

const ORDER_TIMELINE: OrderStatus[] = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'PICKED_UP',
];

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  PENDING: {
    label: 'Pending',
    icon: 'time-outline',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: 'Waiting for shop to confirm your order',
  },
  ACCEPTED: {
    label: 'Accepted',
    icon: 'checkmark-circle-outline',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'Shop has accepted your order',
  },
  PREPARING: {
    label: 'Preparing',
    icon: 'restaurant-outline',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    description: 'Your order is being prepared',
  },
  READY_FOR_PICKUP: {
    label: 'Ready',
    icon: 'bag-check-outline',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    description: 'Your order is ready for pickup!',
  },
  PICKED_UP: {
    label: 'Completed',
    icon: 'checkmark-done-circle-outline',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'Order completed. Enjoy!',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: 'close-circle-outline',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: 'This order has been cancelled',
  },
  CANCELLED_BY_BUSINESS: {
    label: 'Cancelled',
    icon: 'close-circle-outline',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: 'Cancelled by the shop',
  },
  FAILED_PAYMENT: {
    label: 'Payment Failed',
    icon: 'card-outline',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: 'Payment could not be processed',
  },
};

const OrderDetailScreen = () => {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const scheme = useColorScheme();
  const theme = Colors[scheme as keyof typeof Colors];

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation
  const headerScale = useSharedValue(0.9);

  // Use on-brand palette from Colors
  const palette = {
    bg: theme.background,
    card: theme.surface,
    text: theme.text,
    subText: theme.textSecondary,
    border: theme.border,
    success: theme.success,
    warning: theme.warning,
    error: theme.error,
    primary: theme.primary,
    primaryLight: theme.inputBackground,
    accent: theme.accent,
  };

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
      headerScale.value = withSpring(1, { damping: 12 });
    } catch (err: any) {
      console.error('[OrderDetail] Fetch error:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId, headerScale]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrder();
    setRefreshing(false);
  }, [fetchOrder]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleCancelOrder = async () => {
    if (!order) return;

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning
                );
              }
              await cancelOrder(order.id);
              Alert.alert(
                'Order Cancelled',
                'Your order has been cancelled successfully.'
              );
              fetchOrder();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel order');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL(
      'mailto:support@cityventure.com?subject=Order Support - ' +
        order?.order_number
    );
  };

  const handleCallStore = () => {
    Alert.alert('Contact Store', 'Store contact feature coming soon!');
  };

  const handleGoBack = () => {
    router.replace('/(tabs)/(profile)/orders');
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get status configuration
  const getStatusConfig = (status?: string) => {
    const normalizedStatus = status?.toUpperCase() || 'PENDING';
    return STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.PENDING;
  };

  // Get payment method display
  const getPaymentMethodDisplay = (method?: string, methodType?: string) => {
    if (method === 'cash_on_pickup') {
      return { label: 'Cash on Pickup', icon: 'cash-outline' as const };
    }
    if (methodType === 'gcash')
      return { label: 'GCash', icon: 'wallet-outline' as const };
    if (methodType === 'paymaya')
      return { label: 'PayMaya', icon: 'wallet-outline' as const };
    if (methodType === 'grab_pay')
      return { label: 'GrabPay', icon: 'wallet-outline' as const };
    if (methodType === 'card')
      return { label: 'Card', icon: 'card-outline' as const };
    return { label: 'Online Payment', icon: 'card-outline' as const };
  };

  // Check if order is cancellable
  const isCancellable = order?.status === 'PENDING';

  // Check if order is active (not completed/cancelled)
  const isActiveOrder =
    order?.status &&
    ![
      'PICKED_UP',
      'CANCELLED',
      'CANCELLED_BY_BUSINESS',
      'FAILED_PAYMENT',
    ].includes(order.status);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  // Render timeline
  const renderTimeline = () => {
    if (!order) return null;

    const currentStatusIndex = ORDER_TIMELINE.indexOf(
      order.status as OrderStatus
    );
    const isCancelled =
      order.status.includes('CANCELLED') || order.status === 'FAILED_PAYMENT';

    if (isCancelled) {
      const config = getStatusConfig(order.status);
      return (
        <View
          style={[styles.cancelledBanner, { backgroundColor: config.bgColor }]}
        >
          <Ionicons name={config.icon} size={24} color={config.color} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.cancelledTitle, { color: config.color }]}>
              {config.label}
            </Text>
            <Text style={[styles.cancelledDesc, { color: palette.subText }]}>
              {config.description}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.timelineContainer}>
        {ORDER_TIMELINE.map((status, index) => {
          const isCompleted = index < currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          const config = STATUS_CONFIG[status];

          return (
            <View key={status} style={styles.timelineStep}>
              {/* Connector Line */}
              {index > 0 && (
                <View
                  style={[
                    styles.timelineConnector,
                    {
                      backgroundColor:
                        isCompleted || isCurrent
                          ? palette.primary
                          : palette.border,
                    },
                  ]}
                />
              )}

              {/* Step Icon */}
              <View
                style={[
                  styles.timelineIcon,
                  {
                    backgroundColor: isCurrent
                      ? config.color
                      : isCompleted
                      ? palette.primary
                      : palette.border,
                    borderWidth: isCurrent ? 3 : 0,
                    borderColor: isCurrent
                      ? `${config.color}30`
                      : 'transparent',
                  },
                ]}
              >
                <Ionicons
                  name={isCompleted ? 'checkmark' : config.icon}
                  size={isCurrent ? 18 : 14}
                  color="#FFF"
                />
              </View>

              {/* Step Content */}
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineLabel,
                    {
                      color: isCurrent
                        ? config.color
                        : isCompleted
                        ? palette.text
                        : palette.subText,
                      fontWeight: isCurrent ? '700' : '500',
                    },
                  ]}
                >
                  {config.label}
                </Text>
                {isCurrent && (
                  <Text
                    style={[styles.timelineDesc, { color: palette.subText }]}
                  >
                    {config.description}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <>
        <PageContainer>
          <View
            style={[styles.loadingContainer, { backgroundColor: palette.bg }]}
          >
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={[styles.loadingText, { color: palette.subText }]}>
              Loading order...
            </Text>
          </View>
        </PageContainer>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <PageContainer>
          <View
            style={[styles.errorContainer, { backgroundColor: palette.bg }]}
          >
            <View
              style={[
                styles.errorIconContainer,
                { backgroundColor: palette.error + '15' },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={palette.error}
              />
            </View>
            <Text style={[styles.errorTitle, { color: palette.text }]}>
              {error || 'Order not found'}
            </Text>
            <Text style={[styles.errorDesc, { color: palette.subText }]}>
              We couldn't load this order. Please try again.
            </Text>
            <View style={styles.errorActions}>
              <Pressable
                style={[
                  styles.errorButton,
                  { backgroundColor: palette.primary },
                ]}
                onPress={fetchOrder}
              >
                <Ionicons name="refresh-outline" size={20} color="#FFF" />
                <Text style={styles.errorButtonText}>Try Again</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.errorButtonOutline,
                  { borderColor: palette.border },
                ]}
                onPress={handleGoBack}
              >
                <Text
                  style={[
                    styles.errorButtonOutlineText,
                    { color: palette.text },
                  ]}
                >
                  Go Back
                </Text>
              </Pressable>
            </View>
          </View>
        </PageContainer>
      </>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const paymentDisplay = getPaymentMethodDisplay(
    order.payment_method,
    (order as any).payment_method_type
  );

  return (
    <>
      <AppHeader
        backButton
        title={`#${order?.order_number}`}
        background="primary"
        headerBackTitle="Orders"
        rightComponent={
          <Pressable onPress={fetchOrder}>
            <Ionicons name="refresh" size={24} color="white" />
          </Pressable>
        }
      />
      <PageContainer>
        <View style={[styles.container, { backgroundColor: palette.bg }]}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={palette.primary}
              />
            }
          >
            {/* Status Card */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={[
                styles.statusCard,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <Animated.View style={headerAnimatedStyle}>
                <View
                  style={[
                    styles.statusIconLarge,
                    { backgroundColor: statusConfig.color },
                  ]}
                >
                  <Ionicons name={statusConfig.icon} size={32} color="#FFF" />
                </View>
              </Animated.View>
              <Text style={[styles.statusTitle, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
              <Text
                style={[styles.statusDescription, { color: palette.subText }]}
              >
                {statusConfig.description}
              </Text>
            </Animated.View>

            {/* Pickup Code - Show for active orders */}
            {isActiveOrder && order.arrival_code && (
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={[styles.card, { backgroundColor: palette.card }]}
              >
                <View style={styles.pickupCodeHeader}>
                  <Ionicons
                    name="qr-code-outline"
                    size={20}
                    color={palette.primary}
                  />
                  <Text
                    style={[styles.pickupCodeLabel, { color: palette.subText }]}
                  >
                    Pickup Code
                  </Text>
                </View>
                <Text
                  style={[styles.pickupCodeValue, { color: palette.primary }]}
                >
                  {order.arrival_code}
                </Text>
                <Text
                  style={[styles.pickupCodeHint, { color: palette.subText }]}
                >
                  Show this code when collecting your order
                </Text>
              </Animated.View>
            )}

            {/* Timeline */}
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              style={[styles.card, { backgroundColor: palette.card }]}
            >
              <Text style={[styles.cardTitle, { color: palette.text }]}>
                Order Progress
              </Text>
              {renderTimeline()}
            </Animated.View>

            {/* Store Info */}
            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              style={[styles.card, { backgroundColor: palette.card }]}
            >
              <View style={styles.storeHeader}>
                <View
                  style={[
                    styles.storeIcon,
                    { backgroundColor: palette.primaryLight },
                  ]}
                >
                  <Ionicons
                    name="storefront"
                    size={24}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={[styles.storeName, { color: palette.text }]}>
                    {order.business_name || 'Store'}
                  </Text>
                  <Text
                    style={[styles.storeAddress, { color: palette.subText }]}
                  >
                    Pickup Location
                  </Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.storeActions}>
                <Pressable
                  style={[
                    styles.storeActionButton,
                    { backgroundColor: palette.bg },
                  ]}
                  onPress={handleCallStore}
                >
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color={palette.primary}
                  />
                  <Text
                    style={[styles.storeActionText, { color: palette.primary }]}
                  >
                    Call
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.storeActionButton,
                    { backgroundColor: palette.bg },
                  ]}
                  onPress={handleContactSupport}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color={palette.primary}
                  />
                  <Text
                    style={[styles.storeActionText, { color: palette.primary }]}
                  >
                    Support
                  </Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Order Items */}
            <Animated.View
              entering={FadeInDown.delay(500).springify()}
              style={[styles.card, { backgroundColor: palette.card }]}
            >
              <Text style={[styles.cardTitle, { color: palette.text }]}>
                Items ({order.items?.length || 0})
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
                    style={[
                      styles.itemQty,
                      { backgroundColor: palette.primaryLight },
                    ]}
                  >
                    <Text
                      style={[styles.itemQtyText, { color: palette.primary }]}
                    >
                      {item.quantity}x
                    </Text>
                  </View>
                  <View style={styles.itemDetails}>
                    <Text
                      style={[styles.itemName, { color: palette.text }]}
                      numberOfLines={2}
                    >
                      {item.product_name}
                    </Text>
                    {item.special_requests && (
                      <Text
                        style={[styles.itemNote, { color: palette.subText }]}
                        numberOfLines={1}
                      >
                        Note: {item.special_requests}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.itemPrice, { color: palette.text }]}>
                    ₱{item.total_price.toFixed(2)}
                  </Text>
                </View>
              ))}
            </Animated.View>

            {/* Payment Summary */}
            <Animated.View
              entering={FadeInDown.delay(600).springify()}
              style={[styles.card, { backgroundColor: palette.card }]}
            >
              <Text style={[styles.cardTitle, { color: palette.text }]}>
                Payment Summary
              </Text>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: palette.subText }]}>
                  Subtotal
                </Text>
                <Text style={[styles.summaryValue, { color: palette.text }]}>
                  ₱{(order.total_amount || 0).toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: palette.subText }]}>
                  Discount
                </Text>
                <Text style={[styles.summaryValue, { color: palette.success }]}>
                  -₱0.00
                </Text>
              </View>

              <View
                style={[styles.divider, { backgroundColor: palette.border }]}
              />

              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: palette.text }]}>
                  Total
                </Text>
                <Text style={[styles.totalValue, { color: palette.primary }]}>
                  ₱{(order.total_amount || 0).toFixed(2)}
                </Text>
              </View>

              {/* Payment Method */}
              <View
                style={[
                  styles.paymentMethodRow,
                  { backgroundColor: palette.bg },
                ]}
              >
                <Ionicons
                  name={paymentDisplay.icon}
                  size={20}
                  color={palette.subText}
                />
                <Text
                  style={[styles.paymentMethodText, { color: palette.text }]}
                >
                  {paymentDisplay.label}
                </Text>
                <View
                  style={[
                    styles.paymentStatusBadge,
                    {
                      backgroundColor:
                        order.payment_status === 'PAID'
                          ? palette.success + '15'
                          : palette.warning + '15',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentStatusText,
                      {
                        color:
                          order.payment_status === 'PAID'
                            ? palette.success
                            : palette.warning,
                      },
                    ]}
                  >
                    {order.payment_status === 'PAID' ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Order Info */}
            <Animated.View
              entering={FadeInDown.delay(700).springify()}
              style={[styles.card, { backgroundColor: palette.card }]}
            >
              <Text style={[styles.cardTitle, { color: palette.text }]}>
                Order Information
              </Text>

              <View style={styles.infoRow}>
                <View
                  style={[styles.infoIcon, { backgroundColor: palette.bg }]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: palette.subText }]}>
                    Order Placed
                  </Text>
                  <Text style={[styles.infoValue, { color: palette.text }]}>
                    {formatDate(order.created_at)} at{' '}
                    {formatTime(order.created_at)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View
                  style={[styles.infoIcon, { backgroundColor: palette.bg }]}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={palette.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: palette.subText }]}>
                    Pickup Time
                  </Text>
                  <Text style={[styles.infoValue, { color: palette.text }]}>
                    {formatDate(order.pickup_datetime)} at{' '}
                    {formatTime(order.pickup_datetime)}
                  </Text>
                </View>
              </View>

              {order.special_instructions && (
                <View style={styles.infoRow}>
                  <View
                    style={[styles.infoIcon, { backgroundColor: palette.bg }]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color={palette.primary}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text
                      style={[styles.infoLabel, { color: palette.subText }]}
                    >
                      Special Instructions
                    </Text>
                    <Text style={[styles.infoValue, { color: palette.text }]}>
                      {order.special_instructions}
                    </Text>
                  </View>
                </View>
              )}
            </Animated.View>

            {/* Cancel Button */}
            {isCancellable && (
              <Animated.View
                entering={FadeInDown.delay(800).springify()}
                style={[styles.actionCard, { backgroundColor: palette.card }]}
              >
                <Pressable
                  style={[styles.cancelButton, { borderColor: palette.error }]}
                  onPress={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator color={palette.error} />
                  ) : (
                    <>
                      <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color={palette.error}
                      />
                      <Text
                        style={[
                          styles.cancelButtonText,
                          { color: palette.error },
                        ]}
                      >
                        Cancel Order
                      </Text>
                    </>
                  )}
                </Pressable>
              </Animated.View>
            )}

            {/* Help Section */}
            <Animated.View
              entering={FadeInDown.delay(900).springify()}
              style={[styles.card, { backgroundColor: palette.card }]}
            >
              <Pressable
                style={styles.helpButton}
                onPress={handleContactSupport}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={palette.primary}
                />
                <Text
                  style={[styles.helpButtonText, { color: palette.primary }]}
                >
                  Need Help with this Order?
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={palette.subText}
                />
              </Pressable>
            </Animated.View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  errorActions: {
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  errorButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorButtonOutline: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  errorButtonOutlineText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerRefreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 12,
  },
  statusCard: {
    padding: 24,
    alignItems: 'center',
  },
  statusIconLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  pickupCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pickupCodeLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  pickupCodeValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 6,
    marginVertical: 8,
    textAlign: 'center',
  },
  pickupCodeHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  card: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  cancelledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  cancelledTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelledDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  timelineContainer: {
    paddingLeft: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 15,
    top: -20,
    width: 2,
    height: 20,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineLabel: {
    fontSize: 14,
  },
  timelineDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  storeAddress: {
    fontSize: 13,
    marginTop: 2,
  },
  storeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  storeActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  storeActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  itemQty: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  itemQtyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemNote: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 10,
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  paymentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  helpButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrderDetailScreen;
