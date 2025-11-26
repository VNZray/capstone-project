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
import Animated, { FadeInDown } from 'react-native-reanimated';

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

const getStatusLabel = (status: OrderStatus): string => {
  return status.replace(/_/g, ' ');
};

type TabType = 'active' | 'completed' | 'cancelled';

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
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
    primary: colors.primary,
  };

  const loadOrders = useCallback(
    async (isRefresh = false) => {
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
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setOrders(sortedOrders);
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
    },
    [user?.id]
  );

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

  const filterOrders = (tab: TabType) => {
    return orders.filter((order) => {
      const status = order.status;
      if (tab === 'active') {
        return [
          'PENDING',
          'ACCEPTED',
          'PREPARING',
          'READY_FOR_PICKUP',
        ].includes(status);
      } else if (tab === 'completed') {
        return ['PICKED_UP', 'COMPLETED'].includes(status);
      } else {
        return [
          'CANCELLED_BY_USER',
          'CANCELLED_BY_BUSINESS',
          'FAILED_PAYMENT',
        ].includes(status);
      }
    });
  };

  const filteredOrders = filterOrders(activeTab);

  const renderTab = (tab: TabType, label: string) => (
    <Pressable
      style={[
        styles.tab,
        activeTab === tab && {
          borderBottomColor: colors.primary,
          borderBottomWidth: 2,
        },
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          { fontSize: body, fontWeight: '600' },
          { color: activeTab === tab ? colors.primary : palette.subText },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'My Orders',
            headerStyle: { backgroundColor: palette.card },
            headerTintColor: palette.text,
            headerShadowVisible: false,
          }}
        />
        <PageContainer>
          <View
            style={[styles.centerContainer, { backgroundColor: palette.bg }]}
          >
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
          headerShadowVisible: false,
        }}
      />
      <PageContainer>
        <View style={[styles.container, { backgroundColor: palette.bg }]}>
          {/* Tabs */}
          <View
            style={[
              styles.tabsContainer,
              {
                backgroundColor: palette.card,
                borderBottomColor: palette.border,
              },
            ]}
          >
            {renderTab('active', 'Active')}
            {renderTab('completed', 'Completed')}
            {renderTab('cancelled', 'Cancelled')}
          </View>

          {error ? (
            <View style={styles.centerContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={64}
                color={colors.error}
              />
              <Text
                style={[
                  { fontSize: h4 },
                  { color: palette.text, marginTop: 16, textAlign: 'center' },
                ]}
              >
                {error}
              </Text>
              <Pressable
                style={[
                  styles.retryButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => loadOrders()}
              >
                <Text
                  style={[
                    { fontSize: body, fontWeight: '600' },
                    { color: '#FFF' },
                  ]}
                >
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : filteredOrders.length === 0 ? (
            <View style={styles.centerContainer}>
              <View
                style={[
                  styles.emptyIconContainer,
                  { backgroundColor: isDark ? '#1C2833' : '#F3F4F6' },
                ]}
              >
                <Ionicons
                  name={
                    activeTab === 'active'
                      ? 'fast-food-outline'
                      : activeTab === 'completed'
                      ? 'receipt-outline'
                      : 'close-circle-outline'
                  }
                  size={64}
                  color={palette.subText}
                />
              </View>
              <Text
                style={[
                  { fontSize: h4 },
                  { color: palette.text, marginTop: 24 },
                ]}
              >
                No {activeTab} orders
              </Text>
              <Text
                style={[
                  { fontSize: body },
                  {
                    color: palette.subText,
                    marginTop: 8,
                    textAlign: 'center',
                    maxWidth: 250,
                  },
                ]}
              >
                {activeTab === 'active'
                  ? "You don't have any active orders right now."
                  : activeTab === 'completed'
                  ? 'Your past orders will show up here.'
                  : 'Cancelled orders will appear here.'}
              </Text>
              {activeTab === 'active' && (
                <Pressable
                  style={[
                    styles.retryButton,
                    { backgroundColor: colors.primary, marginTop: 24 },
                  ]}
                  onPress={() => router.push('/(tabs)/(home)' as never)}
                >
                  <Text
                    style={[
                      { fontSize: body, fontWeight: '600' },
                      { color: '#FFF' },
                    ]}
                  >
                    Browse Food
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors.primary}
                />
              }
            >
              {filteredOrders.map((order, index) => (
                <Animated.View
                  key={order.id}
                  entering={FadeInDown.delay(index * 100).springify()}
                >
                  <Pressable
                    style={[
                      styles.orderCard,
                      {
                        backgroundColor: palette.card,
                        borderColor: palette.border,
                      },
                    ]}
                    onPress={() => handleOrderPress(order.id)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.businessInfo}>
                        <View
                          style={[
                            styles.businessIcon,
                            { backgroundColor: isDark ? '#2A2F36' : '#F3F4F6' },
                          ]}
                        >
                          <Ionicons
                            name="storefront"
                            size={20}
                            color={palette.subText}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              {
                                fontSize: body,
                                fontWeight: '600',
                                color: palette.text,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {order.business_name || 'Business Name'}
                          </Text>
                          <Text
                            style={[
                              { fontSize: bodySmall, color: palette.subText },
                            ]}
                          >
                            {new Date(order.created_at).toLocaleDateString()} •{' '}
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: `${getStatusColor(
                              order.status
                            )}15`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            {
                              fontSize: bodySmall,
                              fontWeight: '600',
                              color: getStatusColor(order.status),
                            },
                          ]}
                        >
                          {getStatusLabel(order.status)}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: palette.border },
                      ]}
                    />

                    <View style={styles.cardContent}>
                      <View style={styles.itemsSummary}>
                        <Text
                          style={[{ fontSize: body, color: palette.text }]}
                          numberOfLines={1}
                        >
                          {order.items
                            ?.map(
                              (item) => `${item.quantity}x ${item.product_name}`
                            )
                            .join(', ')}
                        </Text>
                        <Text
                          style={[
                            {
                              fontSize: bodySmall,
                              color: palette.subText,
                              marginTop: 4,
                            },
                          ]}
                        >
                          {order.items?.length || 0} items
                        </Text>
                      </View>
                      <View style={styles.priceContainer}>
                        <Text
                          style={[
                            {
                              fontSize: body,
                              fontWeight: '700',
                              color: palette.text,
                            },
                          ]}
                        >
                          ₱{(order.total_amount || 0).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <Pressable
                        style={[
                          styles.actionButton,
                          { borderColor: palette.border },
                        ]}
                        onPress={() => handleOrderPress(order.id)}
                      >
                        <Text
                          style={[
                            {
                              fontSize: bodySmall,
                              fontWeight: '600',
                              color: palette.text,
                            },
                          ]}
                        >
                          View Details
                        </Text>
                      </Pressable>
                      {activeTab === 'active' && (
                        <Pressable
                          style={[
                            styles.actionButton,
                            {
                              backgroundColor: colors.primary,
                              borderColor: colors.primary,
                            },
                          ]}
                          onPress={() => handleOrderPress(order.id)}
                        >
                          <Text
                            style={[
                              {
                                fontSize: bodySmall,
                                fontWeight: '600',
                                color: '#FFF',
                              },
                            ]}
                          >
                            Track Order
                          </Text>
                        </Pressable>
                      )}
                      {activeTab === 'completed' && (
                        <Pressable
                          style={[
                            styles.actionButton,
                            {
                              backgroundColor: palette.text,
                              borderColor: palette.text,
                            },
                          ]}
                          // Reorder logic would go here
                          onPress={() => {}}
                        >
                          <Text
                            style={[
                              {
                                fontSize: bodySmall,
                                fontWeight: '600',
                                color: palette.bg,
                              },
                            ]}
                          >
                            Reorder
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </Pressable>
                </Animated.View>
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  businessIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsSummary: {
    flex: 1,
    marginRight: 16,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  cardActions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 16,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default MyOrdersScreen;
