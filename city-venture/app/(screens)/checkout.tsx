// See spec.md §4 - Tourist flow: Checkout with COP
// See spec.md §7 - POST /api/orders endpoint

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { colors } from '@/constants/color';
import { useTypography } from '@/constants/typography';
import PageContainer from '@/components/PageContainer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/services/OrderService';
import type { CreateOrderPayload } from '@/types/Order';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const CheckoutScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const type = useTypography();
  const { h3, h4, body, bodySmall } = type;
  const { items, businessId, clearCart, getSubtotal } = useCart();
  const { user } = useAuth();

  const [pickupDate, setPickupDate] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_pickup' | 'paymongo'>('cash_on_pickup');
  const [loading, setLoading] = useState(false);

  const palette = {
    bg: isDark ? '#0D1B2A' : '#F8F9FA',
    card: isDark ? '#1C2833' : '#FFFFFF',
    text: isDark ? '#ECEDEE' : '#0D1B2A',
    subText: isDark ? '#9BA1A6' : '#6B7280',
    border: isDark ? '#2A2F36' : '#E5E8EC',
  };

  const subtotal = getSubtotal();
  const taxAmount = 0; // Per spec.md - currently taxAmount=0
  const discountAmount = 0; // No discount for Phase 1
  const total = subtotal - discountAmount + taxAmount;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPickupDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setPickupDate(selectedDate);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to place an order');
      return;
    }

    if (!businessId) {
      Alert.alert('Error', 'No business selected');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart');
      return;
    }

    // Validate pickup datetime is in the future
    if (pickupDate <= new Date()) {
      Alert.alert('Invalid Date', 'Pickup time must be in the future');
      return;
    }

    try {
      setLoading(true);

      // Build order payload per spec.md §7 Create Order Request
      const orderPayload: CreateOrderPayload = {
        business_id: businessId,
        user_id: user.id,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          special_requests: item.special_requests,
        })),
        discount_id: null,
        pickup_datetime: pickupDate.toISOString(),
        special_instructions: specialInstructions || undefined,
        payment_method: paymentMethod,
      };

      console.log('[Checkout] Creating order:', orderPayload);

      // Call backend to create order
      const response = await createOrder(orderPayload);

      console.log('[Checkout] Order created:', response);

      // Clear cart after successful order
      clearCart();

      // Navigate to confirmation screen with order data
      router.replace({
        pathname: '/(screens)/order-confirmation',
        params: {
          orderId: response.order?.id || response.order_id,
          orderNumber: response.order_number,
          arrivalCode: response.arrival_code,
          total: total.toString(),
        },
      } as never);
    } catch (error: any) {
      console.error('[Checkout] Order creation failed:', error);
      
      let errorMessage = 'Failed to create order. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Order Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Checkout',
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
        }}
      />
      <PageContainer>
        <ScrollView
          style={[styles.container, { backgroundColor: palette.bg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Order Items Summary */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <Text style={[{ fontSize: h4 }, { color: palette.text, marginBottom: 12 }]}>
              Order Summary
            </Text>
            {items.map((item) => (
              <View key={item.product_id} style={styles.itemRow}>
                <Text style={[{ fontSize: body }, { color: palette.text, flex: 1 }]} numberOfLines={1}>
                  {item.quantity}x {item.product_name}
                </Text>
                <Text style={[{ fontSize: body }, { color: palette.text }]}>
                  ₱{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Pickup DateTime */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <Text style={[{ fontSize: h4 }, { color: palette.text, marginBottom: 12 }]}>
              Pickup Time
            </Text>
            <Pressable
              style={[styles.dateButton, { borderColor: palette.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[{ fontSize: body }, { color: palette.text, marginLeft: 12 }]}>
                {pickupDate.toLocaleDateString()}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.dateButton, { borderColor: palette.border }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[{ fontSize: body }, { color: palette.text, marginLeft: 12 }]}>
                {pickupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={pickupDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={pickupDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>

          {/* Special Instructions */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <Text style={[{ fontSize: h4 }, { color: palette.text, marginBottom: 12 }]}>
              Special Instructions (Optional)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: palette.bg,
                  color: palette.text,
                  borderColor: palette.border,
                },
              ]}
              placeholder="e.g., leave at counter, call upon arrival"
              placeholderTextColor={palette.subText}
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Payment Method - COP only for Phase 1 */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <Text style={[{ fontSize: h4 }, { color: palette.text, marginBottom: 12 }]}>
              Payment Method
            </Text>
            
            <Pressable
              style={[
                styles.paymentOption,
                {
                  borderColor: paymentMethod === 'cash_on_pickup' ? colors.primary : palette.border,
                  backgroundColor: paymentMethod === 'cash_on_pickup' ? `${colors.primary}10` : palette.bg,
                },
              ]}
              onPress={() => setPaymentMethod('cash_on_pickup')}
            >
              <Ionicons
                name={paymentMethod === 'cash_on_pickup' ? 'radio-button-on' : 'radio-button-off'}
                size={24}
                color={paymentMethod === 'cash_on_pickup' ? colors.primary : palette.subText}
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[{ fontSize: h4 }, { color: palette.text }]}>
                  Cash on Pickup
                </Text>
                <Text style={[{ fontSize: bodySmall }, { color: palette.subText }]}>
                  Pay when you pick up your order
                </Text>
              </View>
              <Ionicons name="cash-outline" size={24} color={colors.primary} />
            </Pressable>

            {/* PayMongo option - disabled for Phase 1 */}
            <Pressable
              style={[
                styles.paymentOption,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.bg,
                  opacity: 0.5,
                },
              ]}
              disabled
            >
              <Ionicons name="radio-button-off" size={24} color={palette.subText} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[{ fontSize: h4 }, { color: palette.subText }]}>
                  Online Payment
                </Text>
                <Text style={[{ fontSize: bodySmall }, { color: palette.subText }]}>
                  Coming soon (Phase 2)
                </Text>
              </View>
              <Ionicons name="card-outline" size={24} color={palette.subText} />
            </Pressable>
          </View>

          {/* Total Summary */}
          <View style={[styles.section, { backgroundColor: palette.card }]}>
            <View style={styles.summaryRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Subtotal</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>₱{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Discount</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>-₱{discountAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[{ fontSize: body }, { color: palette.subText }]}>Tax</Text>
              <Text style={[{ fontSize: body }, { color: palette.text }]}>₱{taxAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: palette.border }]} />
            <View style={styles.summaryRow}>
              <Text style={[{ fontSize: h3 }, { color: palette.text }]}>Total</Text>
              <Text style={[{ fontSize: h3 }, { color: colors.primary }]}>₱{total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Place Order Button */}
          <Pressable
            style={[
              styles.placeOrderButton,
              {
                backgroundColor: loading ? palette.border : colors.primary,
              },
            ]}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                <Text style={[{ fontSize: h4 }, { color: '#FFF', marginLeft: 12 }]}>
                  Place Order
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </PageContainer>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
  },
});

export default CheckoutScreen;
