/**
 * Payment Cancel Screen
 * Displayed when user cancels/closes PayMongo checkout without completing payment
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { Ionicons } from '@expo/vector-icons';
import { initiatePayment, openPayMongoCheckout } from '@/services/PaymentService';

const PaymentCancelScreen = () => {
  const params = useLocalSearchParams<{ orderId: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h2, body, bodySmall } = type;
  const [retrying, setRetrying] = useState(false);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  const handleRetryPayment = async () => {
    try {
      setRetrying(true);
      console.log('[PaymentCancel] Retrying payment for order:', params.orderId);

      // Initiate payment through backend
      const response = await initiatePayment({
        order_id: params.orderId,
        use_checkout_session: true,
      });

      if (!response.success || !response.data.checkout_url) {
        throw new Error(response.message || 'Failed to initiate payment');
      }

      console.log('[PaymentCancel] Opening PayMongo checkout...');
      
      // Open PayMongo checkout - user will be redirected back via deep link
      await openPayMongoCheckout(response.data.checkout_url);
      
      // Note: Stay on this screen. When payment completes or is cancelled,
      // PayMongo will deep link to payment-success or payment-cancel screen.
      // This prevents showing "Order Confirmed" before payment is actually completed.

    } catch (error: any) {
      console.error('[PaymentCancel] Payment retry failed:', error);
      Alert.alert(
        'Payment Error',
        error.response?.data?.message || error.message || 'Failed to start payment process'
      );
    } finally {
      setRetrying(false);
    }
  };

  const handleViewOrder = () => {
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
          title: 'Payment Pending',
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
          headerLeft: () => null,
        }}
      />
      <PageContainer>
        <View style={[styles.container, { backgroundColor: palette.bg }]}>
          {/* Info Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${colors.warning}20` }]}>
            <Ionicons name="close-circle-outline" size={80} color={colors.warning} />
          </View>

          <Text style={[{ fontSize: h2 }, { color: palette.text, textAlign: 'center', marginTop: 24 }]}>
            Payment Not Completed
          </Text>

          <Text style={[{ fontSize: body }, { color: palette.subText, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 }]}>
            Payment was not completed. Your order is pending and will be cancelled automatically if payment is not received.
          </Text>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[{ fontSize: bodySmall }, { color: palette.text, fontWeight: '600', marginBottom: 4 }]}>
                  What happens next?
                </Text>
                <Text style={[{ fontSize: bodySmall }, { color: palette.subText, lineHeight: 20 }]}>
                  • Your order is NOT confirmed yet{'\n'}
                  • Complete payment to confirm your order{'\n'}
                  • Business will NOT receive your order until paid{'\n'}
                  • Order will auto-cancel if not paid soon
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleRetryPayment}
              disabled={retrying}
            >
              {retrying ? (
                <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="card-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
              )}
              <Text style={[{ fontSize: body, fontWeight: '600' }, { color: '#FFF' }]}>
                {retrying ? 'Opening Payment...' : 'Retry Payment'}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 }]}
              onPress={handleViewOrder}
            >
              <Text style={[{ fontSize: body, fontWeight: '600' }, { color: palette.text }]}>
                View Order Details
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 }]}
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
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  infoCard: {
    marginTop: 32,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  buttonContainer: {
    marginTop: 32,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default PaymentCancelScreen;
