import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/color';
import PageContainer from '@/components/PageContainer';
import { Ionicons } from '@expo/vector-icons';

/**
 * Payment Failed Screen
 * Shown when payment fails, with options to retry or view order
 *
 * Handles two scenarios:
 * 1. Order was created but payment failed → Show order options
 * 2. Order was not created → Go back to checkout
 */
const PaymentFailedScreen = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[(colorScheme ?? 'light') as keyof typeof Colors];

  const params = useLocalSearchParams<{
    orderId?: string;
    orderNumber?: string;
    arrivalCode?: string;
    total?: string;
    errorMessage?: string;
    errorTitle?: string;
    isCardError?: string;
    orderCreated?: string;
  }>();

  const orderCreated = params.orderCreated === 'true';
  const isCardError = params.isCardError === 'true';
  const errorTitle = params.errorTitle || 'Payment Failed';

  const handleViewOrder = () => {
    if (params.orderId) {
      router.replace(
        Routes.checkout.orderConfirmation({
          orderId: params.orderId,
          orderNumber: params.orderNumber,
          arrivalCode: params.arrivalCode,
          total: params.total,
          paymentMethod: 'paymongo',
          paymentPending: 'true',
        })
      );
    } else {
      router.replace(Routes.profile.orders.index);
    }
  };

  const handleGoBack = () => {
    // Navigate back to checkout to try again
    router.back();
  };

  const handleViewOrders = () => {
    router.replace(Routes.profile.orders.index);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: errorTitle,
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <PageContainer padding={24}>
        <View style={styles.container}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${theme.error}15` },
            ]}
          >
            <Ionicons name="close-circle" size={80} color={theme.error} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            {errorTitle}
          </Text>

          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {params.errorMessage ||
              'Your payment could not be processed. Please try again.'}
          </Text>

          {/* Order Info - only show if order was created */}
          {orderCreated && params.orderNumber && (
            <View
              style={[styles.orderInfo, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>
                Order Number
              </Text>
              <Text style={[styles.orderNumber, { color: theme.text }]}>
                {params.orderNumber}
              </Text>
            </View>
          )}

          {/* Info message based on context */}
          <View
            style={[styles.infoBox, { backgroundColor: `${theme.info}10` }]}
          >
            <Ionicons name="information-circle" size={20} color={theme.info} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {orderCreated
                ? 'Your order has been saved. You can retry payment from your order details.'
                : isCardError
                ? 'You can try a different card or switch to GCash/Maya.'
                : 'Please check your payment details and try again.'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {orderCreated ? (
              <>
                {/* Order created - show View Order as primary */}
                <Pressable
                  style={[
                    styles.primaryButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleViewOrder}
                >
                  <Ionicons name="receipt-outline" size={20} color="#FFF" />
                  <Text style={styles.primaryButtonText}>View Order</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.secondaryButton,
                    { borderColor: theme.border },
                  ]}
                  onPress={handleGoBack}
                >
                  <Text
                    style={[styles.secondaryButtonText, { color: theme.text }]}
                  >
                    Try Different Payment
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* No order created - show Go Back as primary */}
                <Pressable
                  style={[
                    styles.primaryButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={handleGoBack}
                >
                  <Ionicons name="arrow-back" size={20} color="#FFF" />
                  <Text style={styles.primaryButtonText}>
                    {isCardError ? 'Try Different Card' : 'Try Again'}
                  </Text>
                </Pressable>

                {isCardError && (
                  <Pressable
                    style={[
                      styles.secondaryButton,
                      { borderColor: theme.border },
                    ]}
                    onPress={handleGoBack}
                  >
                    <Text
                      style={[
                        styles.secondaryButtonText,
                        { color: theme.text },
                      ]}
                    >
                      Switch to GCash/Maya
                    </Text>
                  </Pressable>
                )}
              </>
            )}

            {/* Always show View Orders option */}
            <Pressable style={styles.textButton} onPress={handleViewOrders}>
              <Text style={[styles.textButtonText, { color: theme.primary }]}>
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
  textButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  textButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PaymentFailedScreen;
