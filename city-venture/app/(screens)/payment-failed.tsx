import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import PageContainer from '@/components/PageContainer';
import { Ionicons } from '@expo/vector-icons';

/**
 * Payment Failed Screen
 * Shown when payment fails, with options to retry or view order
 */
const PaymentFailedScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const params = useLocalSearchParams<{
    orderId: string;
    orderNumber: string;
    errorMessage?: string;
  }>();

  const handleRetryPayment = () => {
    // Navigate back to order details where user can retry payment
    router.replace({
      pathname: '/(tabs)/orders',
    } as never);
  };

  const handleViewOrder = () => {
    router.replace({
      pathname: '/(tabs)/orders',
    } as never);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Payment Failed',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <PageContainer padding={24}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.error}15` }]}>
            <Ionicons name="close-circle" size={80} color={theme.error} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Payment Failed
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {params.errorMessage || 'Your payment could not be processed. Please try again.'}
          </Text>

          {params.orderNumber && (
            <View style={[styles.orderInfo, { backgroundColor: theme.surface }]}>
              <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>
                Order Number
              </Text>
              <Text style={[styles.orderNumber, { color: theme.text }]}>
                {params.orderNumber}
              </Text>
            </View>
          )}

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Your order has been saved. You can retry payment from your order details.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={handleRetryPayment}
            >
              <Ionicons name="refresh" size={20} color="#FFF" />
              <Text style={styles.primaryButtonText}>Retry Payment</Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={handleViewOrder}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                View My Orders
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
    alignItems: 'center',
    paddingTop: 60,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  orderInfo: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  orderLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 32,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentFailedScreen;
