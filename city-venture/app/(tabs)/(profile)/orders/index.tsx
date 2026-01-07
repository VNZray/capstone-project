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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/context/AuthContext';
import { getUserOrders } from '@/services/OrderService';
import type { Order } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import OrderCard from '@/components/OrderCard';
import { AppHeader } from '@/components/header/AppHeader';

type TabType = 'active' | 'completed' | 'cancelled';

const MyOrdersScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h4, body } = type;
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
    router.push(Routes.profile.orders.detail(orderId));
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
      <AppHeader backButton title="My Orders" background="primary" />

      <PageContainer padding={0}>
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
                  onPress={() => router.push(Routes.tabs.home)}
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
              contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
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
                  <OrderCard
                    order={order}
                    onPress={handleOrderPress}
                    activeTab={activeTab}
                  />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
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
