// See spec.md §4 - Order confirmation with arrival code
// Order confirmation screen shown after successful order placement
// Grace period happens BEFORE this screen (in order-grace-period.tsx)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { getOrderById } from '@/services/OrderService';
import { Ionicons } from '@expo/vector-icons';
import type { Order } from '@/types/Order';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const OrderConfirmationScreen = () => {
  const params = useLocalSearchParams<{
    orderId: string;
    orderNumber?: string;
    arrivalCode?: string;
    total?: string;
    paymentMethod?: string;
    paymentSuccess?: string;
    businessId?: string;
  }>();

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  // Typography hook available if needed for custom font sizes
  useTypography();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const checkScale = useSharedValue(0);
  const cardTranslate = useSharedValue(50);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F5F7FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#1A1A2E',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E8ECF0',
    success: '#10B981',
    successLight: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
    warning: '#F59E0B',
    warningLight: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB',
    primary: colors.primary,
    primaryLight: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
  };

  // Fetch order details
  const fetchOrderDetails = useCallback(async () => {
    if (!params.orderId) {
      setError('Order ID not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const orderData = await getOrderById(params.orderId);
      setOrder(orderData);
      
      // Trigger success haptic and animations
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      checkScale.value = withDelay(300, withSpring(1, { damping: 12 }));
      cardTranslate.value = withDelay(500, withSpring(0, { damping: 15 }));
    } catch (err: any) {
      console.error('[OrderConfirmation] Failed to fetch order:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [params.orderId, checkScale, cardTranslate]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleViewOrderDetails = () => {
    router.replace(Routes.profile.orders.detail(params.orderId));
  };

  const handleBackToHome = () => {
    router.replace(Routes.tabs.home);
  };

  const handleShareOrder = async () => {
    if (!order) return;
    
    try {
      await Share.share({
        message: `🛒 Order Confirmed!\n\nOrder #${order.order_number}\nPickup Code: ${order.arrival_code}\nTotal: ₱${order.total_amount.toFixed(2)}\n\nShow this code when picking up your order at ${order.business_name || 'the store'}.`,
        title: 'Order Confirmation',
      });
    } catch (err) {
      console.error('[OrderConfirmation] Share failed:', err);
    }
  };

  // Determine payment status
  const isPaymentComplete = params.paymentMethod !== 'paymongo' || 
    params.paymentSuccess === 'true' ||
    order?.payment_status?.toUpperCase() === 'PAID';

  // Animated styles
  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  // Format pickup datetime
  const formatPickupTime = (dateString?: string) => {
    if (!dateString) return 'As soon as possible';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (date.toDateString() === today.toDateString()) dayLabel = 'Today';
    else if (date.toDateString() === tomorrow.toDateString()) dayLabel = 'Tomorrow';

    const timeLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dayLabel} at ${timeLabel}`;
  };

  // Get status info
  const getStatusInfo = (status?: string) => {
    const normalizedStatus = status?.toUpperCase() || 'PENDING';
    switch (normalizedStatus) {
      case 'PENDING':
        return { label: 'Pending Confirmation', color: palette.warning, icon: 'time-outline' as const };
      case 'ACCEPTED':
        return { label: 'Order Accepted', color: palette.success, icon: 'checkmark-circle-outline' as const };
      case 'PREPARING':
        return { label: 'Being Prepared', color: colors.primary, icon: 'restaurant-outline' as const };
      case 'READY_FOR_PICKUP':
        return { label: 'Ready for Pickup!', color: palette.success, icon: 'bag-check-outline' as const };
      default:
        return { label: 'Processing', color: palette.subText, icon: 'hourglass-outline' as const };
    }
  };

  // Get payment method label
  const getPaymentMethodLabel = (method?: string, methodType?: string) => {
    if (method === 'cash_on_pickup') return 'Cash on Pickup';
    if (methodType === 'gcash') return 'GCash';
    if (methodType === 'paymaya') return 'PayMaya';
    if (methodType === 'grab_pay') return 'GrabPay';
    if (methodType === 'card') return 'Credit/Debit Card';
    return 'Online Payment';
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <PageContainer>
          <View style={[styles.loadingContainer, { backgroundColor: palette.bg }]}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={[styles.loadingText, { color: palette.subText }]}>
              Loading order details...
            </Text>
          </View>
        </PageContainer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <PageContainer>
          <View style={[styles.errorContainer, { backgroundColor: palette.bg }]}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={[styles.errorText, { color: palette.text }]}>{error}</Text>
            <Pressable
              style={[styles.retryButton, { backgroundColor: palette.primary }]}
              onPress={fetchOrderDetails}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        </PageContainer>
      </>
    );
  }

  const orderNumber = order?.order_number || params.orderNumber || 'N/A';
  const arrivalCode = order?.arrival_code || params.arrivalCode || '----';
  const totalAmount = order?.total_amount || parseFloat(params.total || '0');
  const statusInfo = getStatusInfo(order?.status);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <PageContainer>
        <ScrollView
          style={[styles.container, { backgroundColor: palette.bg }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Header with Gradient */}
          <LinearGradient
            colors={isPaymentComplete 
              ? [palette.success, '#059669'] 
              : [palette.warning, '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Animated.View style={[styles.checkContainer, checkAnimatedStyle]}>
              <View style={styles.checkCircle}>
                <Ionicons 
                  name={isPaymentComplete ? "checkmark" : "time"} 
                  size={48} 
                  color={isPaymentComplete ? palette.success : palette.warning} 
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400).springify()}>
              <Text style={styles.headerTitle}>
                {isPaymentComplete ? 'Order Confirmed!' : 'Order Placed'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isPaymentComplete 
                  ? 'Thank you for your order' 
                  : 'Awaiting payment confirmation'}
              </Text>
            </Animated.View>
          </LinearGradient>

          {/* Pickup Code Card - Most Important */}
          <Animated.View 
            entering={FadeInDown.delay(500).springify()}
            style={[styles.pickupCard, { backgroundColor: palette.card }]}
          >
            <View style={styles.pickupHeader}>
              <Ionicons name="qr-code-outline" size={24} color={palette.primary} />
              <Text style={[styles.pickupLabel, { color: palette.subText }]}>
                Pickup Code
              </Text>
            </View>
            <Text style={[styles.pickupCode, { color: palette.primary }]}>
              {arrivalCode}
            </Text>
            <Text style={[styles.pickupHint, { color: palette.subText }]}>
              Show this code when collecting your order
            </Text>
          </Animated.View>

          {/* Order Status Timeline */}
          <Animated.View 
            entering={FadeInDown.delay(600).springify()}
            style={[styles.statusCard, { backgroundColor: palette.card }]}
          >
            <View style={styles.statusHeader}>
              <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
              <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
            <View style={[styles.statusBar, { backgroundColor: palette.border }]}>
              <View 
                style={[
                  styles.statusProgress, 
                  { 
                    backgroundColor: statusInfo.color,
                    width: order?.status === 'PENDING' ? '25%' : 
                           order?.status === 'ACCEPTED' ? '50%' :
                           order?.status === 'PREPARING' ? '75%' : '100%'
                  }
                ]} 
              />
            </View>
          </Animated.View>

          {/* Order Details */}
          <Animated.View 
            entering={FadeInDown.delay(700).springify()}
            style={[styles.detailsCard, { backgroundColor: palette.card }]}
          >
            <Text style={[styles.sectionTitle, { color: palette.text }]}>
              Order Details
            </Text>

            {/* Order Number */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="receipt-outline" size={18} color={palette.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: palette.subText }]}>Order Number</Text>
                <Text style={[styles.detailValue, { color: palette.text }]}>#{orderNumber}</Text>
              </View>
            </View>

            {/* Business/Pickup Location */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="storefront-outline" size={18} color={palette.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: palette.subText }]}>Pickup Location</Text>
                <Text style={[styles.detailValue, { color: palette.text }]}>
                  {order?.business_name || 'Store'}
                </Text>
              </View>
            </View>

            {/* Pickup Time */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time-outline" size={18} color={palette.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: palette.subText }]}>Pickup Time</Text>
                <Text style={[styles.detailValue, { color: palette.text }]}>
                  {formatPickupTime(order?.pickup_datetime)}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: palette.border }]} />

            {/* Payment Method */}
            <View style={styles.detailRow}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="card-outline" size={18} color={palette.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: palette.subText }]}>Payment Method</Text>
                <Text style={[styles.detailValue, { color: palette.text }]}>
                  {getPaymentMethodLabel(
                    order?.payment_method || params.paymentMethod,
                    (order as any)?.payment_method_type
                  )}
                </Text>
              </View>
              <View style={[
                styles.paymentBadge, 
                { backgroundColor: isPaymentComplete ? palette.successLight : palette.warningLight }
              ]}>
                <Text style={[
                  styles.paymentBadgeText, 
                  { color: isPaymentComplete ? palette.success : palette.warning }
                ]}>
                  {isPaymentComplete ? 'Paid' : 'Pending'}
                </Text>
              </View>
            </View>

            {/* Total Amount */}
            <View style={[styles.totalRow, { borderTopColor: palette.border }]}>
              <Text style={[styles.totalLabel, { color: palette.text }]}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: palette.primary }]}>
                ₱{totalAmount.toFixed(2)}
              </Text>
            </View>
          </Animated.View>

          {/* Items Preview (if available) */}
          {order?.items && order.items.length > 0 && (
            <Animated.View 
              entering={FadeInDown.delay(800).springify()}
              style={[styles.itemsCard, { backgroundColor: palette.card }]}
            >
              <Text style={[styles.sectionTitle, { color: palette.text }]}>
                Items ({order.items.length})
              </Text>
              {order.items.slice(0, 3).map((item, index) => (
                <View key={item.id || index} style={styles.itemRow}>
                  <View style={[styles.itemQty, { backgroundColor: palette.primaryLight }]}>
                    <Text style={[styles.itemQtyText, { color: palette.primary }]}>
                      {item.quantity}x
                    </Text>
                  </View>
                  <Text style={[styles.itemName, { color: palette.text }]} numberOfLines={1}>
                    {item.product_name || 'Item'}
                  </Text>
                  <Text style={[styles.itemPrice, { color: palette.subText }]}>
                    ₱{item.total_price.toFixed(2)}
                  </Text>
                </View>
              ))}
              {order.items.length > 3 && (
                <Pressable onPress={handleViewOrderDetails}>
                  <Text style={[styles.moreItems, { color: palette.primary }]}>
                    +{order.items.length - 3} more items
                  </Text>
                </Pressable>
              )}
            </Animated.View>
          )}

          {/* Action Buttons */}
          <Animated.View 
            entering={FadeInDown.delay(900).springify()}
            style={styles.actionsContainer}
          >
            <Pressable
              style={[styles.primaryButton, { backgroundColor: palette.primary }]}
              onPress={handleViewOrderDetails}
            >
              <Ionicons name="eye-outline" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Track Order</Text>
            </Pressable>

            <View style={styles.secondaryActions}>
              <Pressable
                style={[styles.secondaryButton, { backgroundColor: palette.card, borderColor: palette.border }]}
                onPress={handleShareOrder}
              >
                <Ionicons name="share-outline" size={20} color={palette.text} />
                <Text style={[styles.secondaryButtonText, { color: palette.text }]}>Share</Text>
              </Pressable>

              <Pressable
                style={[styles.secondaryButton, { backgroundColor: palette.card, borderColor: palette.border }]}
                onPress={handleBackToHome}
              >
                <Ionicons name="home-outline" size={20} color={palette.text} />
                <Text style={[styles.secondaryButtonText, { color: palette.text }]}>Home</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Bottom Spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
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
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  checkContainer: {
    marginBottom: 20,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 6,
  },
  pickupCard: {
    marginHorizontal: 16,
    marginTop: -24,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  pickupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pickupLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  pickupCode: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 8,
    marginVertical: 8,
  },
  pickupHint: {
    fontSize: 13,
    textAlign: 'center',
  },
  statusCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  statusProgress: {
    height: '100%',
    borderRadius: 3,
  },
  detailsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  itemsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemQty: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  itemQtyText: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default OrderConfirmationScreen;
