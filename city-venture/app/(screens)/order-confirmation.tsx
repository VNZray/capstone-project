// See spec.md §4 - Order confirmation with arrival code
// See spec.md §5 - Grace period (10s default)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { cancelOrder } from '@/services/OrderService';
import { Ionicons } from '@expo/vector-icons';

const OrderConfirmationScreen = () => {
  const params = useLocalSearchParams<{
    orderId: string;
    orderNumber: string;
    arrivalCode: string;
    total: string;
  }>();

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h2, h1, h4, body, bodySmall } = type;

  const [graceTimeRemaining, setGraceTimeRemaining] = useState(10); // 10 seconds grace period
  const [cancelling, setCancelling] = useState(false);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  // Grace period countdown timer
  useEffect(() => {
    if (graceTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setGraceTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [graceTimeRemaining]);

  const handleCancelOrder = async () => {
    if (graceTimeRemaining <= 0) {
      Alert.alert(
        'Cannot Cancel',
        'Grace period has expired. Please contact the business to cancel this order.'
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
              await cancelOrder(params.orderId);
              
              Alert.alert(
                'Order Cancelled',
                'Your order has been cancelled successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/(tabs)/(home)' as never),
                  },
                ]
              );
            } catch (error: any) {
              console.error('[OrderConfirmation] Cancel failed:', error);
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

  const handleViewOrderDetails = () => {
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
          title: 'Order Confirmed',
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
          headerLeft: () => null, // Disable back button
        }}
      />
      <PageContainer>
        <View style={[styles.container, { backgroundColor: palette.bg }]}>
          {/* Success Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${colors.success}20` }]}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>

          <Text style={[{ fontSize: h2 }, { color: palette.text, textAlign: 'center', marginTop: 24 }]}>
            Order Confirmed!
          </Text>

          <Text style={[{ fontSize: body }, { color: palette.subText, textAlign: 'center', marginTop: 8 }]}>
            Your order has been placed successfully
          </Text>

          {/* Order Details Card */}
          <View style={[styles.detailsCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            {/* Order Number */}
            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Order Number</Text>
              <Text style={[{ fontSize: h4 }, { color: palette.text, fontWeight: '600' }]}>
                {params.orderNumber}
              </Text>
            </View>

            {/* Arrival Code */}
            <View style={[styles.codeContainer, { backgroundColor: palette.bg, borderColor: colors.primary }]}>
              <Text style={[{ fontSize: body }, { color: palette.subText, marginBottom: 8 }]}>
                Arrival Code
              </Text>
              <Text style={[{ fontSize: h1 }, { color: colors.primary, letterSpacing: 8 }]}>
                {params.arrivalCode}
              </Text>
              <Text style={[{ fontSize: bodySmall }, { color: palette.subText, marginTop: 8, textAlign: 'center' }]}>
                Show this code when picking up your order
              </Text>
            </View>

            {/* Total Amount */}
            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Total Amount</Text>
              <Text style={[{ fontSize: h4 }, { color: colors.primary }]}>
                ₱{parseFloat(params.total).toFixed(2)}
              </Text>
            </View>

            {/* Payment Status */}
            <View style={styles.detailRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Payment Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${colors.warning}20` }]}>
                <Text style={[{ fontSize: bodySmall }, { color: colors.warning }]}>PENDING</Text>
              </View>
            </View>
          </View>

          {/* Grace Period Warning */}
          {graceTimeRemaining > 0 && (
            <View style={[styles.graceContainer, { backgroundColor: `${colors.warning}15`, borderColor: colors.warning }]}>
              <Ionicons name="time-outline" size={20} color={colors.warning} />
              <Text style={[{ fontSize: bodySmall }, { color: palette.text, marginLeft: 8, flex: 1 }]}>
                You can cancel this order within {graceTimeRemaining} seconds
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {graceTimeRemaining > 0 && (
              <Pressable
                style={[
                  styles.button,
                  styles.cancelButton,
                  { backgroundColor: palette.card, borderColor: colors.error },
                ]}
                onPress={handleCancelOrder}
                disabled={cancelling}
              >
                <Text style={[{ fontSize: body, fontWeight: '600' }, { color: colors.error }]}>
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleViewOrderDetails}
            >
              <Text style={[{ fontSize: body, fontWeight: '600' }, { color: '#FFF' }]}>
                View Order Details
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.secondaryButton, { backgroundColor: palette.card, borderColor: palette.border }]}
              onPress={handleBackToHome}
            >
              <Text style={[{ fontSize: body, fontWeight: '600' }, { color: palette.text }]}>
                Back to Home
              </Text>
            </Pressable>
          </View>
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
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40,
  },
  detailsCard: {
    marginTop: 32,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  codeContainer: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginVertical: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  graceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButton: {
    borderWidth: 2,
  },
  secondaryButton: {
    borderWidth: 1,
  },
});

export default OrderConfirmationScreen;
