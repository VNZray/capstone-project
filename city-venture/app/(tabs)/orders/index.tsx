// See spec.md §4 - Tourist can track orders
// See spec.md §5 - Order Status enums

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders } from '@/services/OrderService';
import type { Order, OrderStatus } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';

// See spec.md §5 - Status badge colors
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

const MyOrdersScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h4, body, bodySmall } = type;
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (!user?.id) {
      setLoading(false);
      setError('Please log in to view orders');
      return;
    }

    try {
      setError(null);
      const fetchedOrders = await getUserOrders(user.id);
      
      // Sort by created_at DESC
      const sortedOrders = fetchedOrders.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setOrders(sortedOrders);
      console.log('[MyOrders] Loaded orders:', sortedOrders.length);
    } catch (error: any) {
      console.error('[MyOrders] Load failed:', error);
      setError(error.message || 'Failed to load orders');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(true);
  }, [loadOrders]);

  const handleOrderPress = (orderId: string) => {
    router.push({
      pathname: '/(tabs)/orders/[orderId]',
      params: { orderId },
    } as never);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'My Orders',
            headerStyle: { backgroundColor: palette.card },
            headerTintColor: palette.text,
          }}
        />
        <PageContainer>
          <View style={[styles.centerContainer, { backgroundColor: palette.bg }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Orders',
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
        }}
      />
      <PageContainer>
        <View style={[styles.container, { backgroundColor: palette.bg }]}>
          {error ? (
            <View style={styles.centerContainer}>
              <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
              <Text style={[{ fontSize: h4 }, { color: palette.text, marginTop: 16, textAlign: 'center' }]}>
                {error}
              </Text>
              <Pressable
                style={[styles.retryButton, { backgroundColor: colors.primary }]}
                onPress={() => loadOrders()}
              >
                <Text style={[{ fontSize: body, fontWeight: '600' }, { color: '#FFF' }]}>Retry</Text>
              </Pressable>
            </View>
          ) : orders.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="receipt-outline" size={80} color={palette.subText} />
              <Text style={[{ fontSize: h4 }, { color: palette.text, marginTop: 16 }]}>
                No orders yet
              </Text>
              <Text style={[{ fontSize: body }, { color: palette.subText, marginTop: 8, textAlign: 'center' }]}>
                Your orders will appear here once you place them
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors.primary}
                />
              }
            >
              {orders.map((order) => (
                <Pressable
                  key={order.id}
                  style={[styles.orderCard, { backgroundColor: palette.card, borderColor: palette.border }]}
                  onPress={() => handleOrderPress(order.id)}
                >
                  {/* Order Header */}
                  <View style={styles.orderHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[{ fontSize: h4 }, { color: palette.text, fontWeight: '600' }]}>
                        {order.order_number}
                      </Text>
                      {order.business_name && (
                        <Text style={[{ fontSize: bodySmall }, { color: palette.subText, marginTop: 2 }]}>
                          {order.business_name}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
                      <Text style={[{ fontSize: bodySmall }, { color: getStatusColor(order.status) }]}>
                        {order.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  {/* Order Info */}
                  <View style={styles.orderInfo}>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={16} color={palette.subText} />
                      <Text style={[{ fontSize: bodySmall }, { color: palette.subText, marginLeft: 8 }]}>
                        {new Date(order.created_at).toLocaleDateString()} at{' '}
                        {new Date(order.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="cash-outline" size={16} color={palette.subText} />
                      <Text style={[{ fontSize: bodySmall }, { color: palette.subText, marginLeft: 8 }]}>
                        {order.payment_method.replace(/_/g, ' ').toUpperCase()} • {order.payment_status}
                      </Text>
                    </View>

                    {order.items && order.items.length > 0 && (
                      <View style={styles.infoRow}>
                        <Ionicons name="list-outline" size={16} color={palette.subText} />
                        <Text style={[{ fontSize: bodySmall }, { color: palette.subText, marginLeft: 8 }]}>
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Order Total */}
                  <View style={styles.orderFooter}>
                    <Text style={[{ fontSize: body }, { color: palette.subText }]}>Total</Text>
                    <Text style={[{ fontSize: h4 }, { color: colors.primary }]}>
                      ₱{order.total_amount.toFixed(2)}
                    </Text>
                  </View>

                  {/* View Details Arrow */}
                  <View style={styles.arrowContainer}>
                    <Ionicons name="chevron-forward" size={20} color={palette.subText} />
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
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
    paddingHorizontal: 32,
  },
  scrollView: {
    flex: 1,
  },
  orderCard: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  orderInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
});

export default MyOrdersScreen;
