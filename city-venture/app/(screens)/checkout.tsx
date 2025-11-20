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
import { openPayMongoCheckout } from '@/services/PaymentService';
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
  const [paymentMethodType, setPaymentMethodType] = useState<'gcash' | 'card' | 'paymaya' | 'grab_pay'>('gcash');
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
    const now = new Date();
    const maxPickupTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
    
    if (pickupDate <= now) {
      Alert.alert('Invalid Date', 'Pickup time must be in the future');
      return;
    }
    
    if (pickupDate > maxPickupTime) {
      Alert.alert('Invalid Time', 'Pickup time cannot be more than 3 hours from now');
      return;
    }
    
    // Validate pickup date is within 2 days
    const maxPickupDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    if (pickupDate > maxPickupDate) {
      Alert.alert('Invalid Date', 'Pickup date cannot be more than 2 days from today');
      return;
    }

    try {
      setLoading(true);

      // Build order payload per spec.md §7 Create Order Request
      // Note: user_id is NOT included - backend extracts it from JWT token (req.user.id)
      const orderPayload: CreateOrderPayload = {
        business_id: businessId,
        user_id: user.id, // Still needed for type compatibility, backend will use req.user.id
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          special_requests: item.special_requests,
        })),
        discount_id: null,
        pickup_datetime: pickupDate.toISOString(),
        special_instructions: specialInstructions || undefined,
        payment_method: paymentMethod,
        payment_method_type: paymentMethod === 'paymongo' ? paymentMethodType : undefined,
      };

      console.log('[Checkout] Creating order:', orderPayload);

      // Call backend to create order
      const orderResponse = await createOrder(orderPayload);

      console.log('[Checkout] Order created:', orderResponse);

      // Clear cart after successful order
      clearCart();

      const checkoutUrl = orderResponse.checkout_url;

      // Per spec.md §4 & §7: PayMongo flow - redirect to checkout immediately
      if (paymentMethod === 'paymongo') {
        if (checkoutUrl) {
          console.log('[Checkout] Opening PayMongo checkout:', checkoutUrl);

          try {
            // Open PayMongo checkout - user will be redirected back via deep link
            // Success: cityventure://orders/{orderId}/payment-success
            // Cancel: cityventure://orders/{orderId}/payment-cancel
            await openPayMongoCheckout(checkoutUrl);
            
            // Navigate to payment-cancel screen as default
            // This handles the case where user presses back without completing payment
            // If payment succeeds, the deep link will override this and go to payment-success
            router.replace({
              pathname: '/(screens)/payment-cancel',
              params: {
                orderId: orderResponse.order_id,
              },
            } as never);
            return;
          } catch (checkoutError: any) {
            console.error('[Checkout] Failed to open PayMongo checkout:', checkoutError);
            Alert.alert(
              'Payment Error',
              'Failed to open payment page. You can retry payment from your orders.',
              [
                {
                  text: 'View Orders',
                  onPress: () => {
                    router.replace('/(tabs)/orders' as never);
                  },
                },
                {
                  text: 'OK',
                  style: 'cancel',
                },
              ]
            );
            return;
          }
        } else {
          // No checkout URL - allow user to retry via initiatePayment
          Alert.alert(
            'Payment Warning',
            'Payment checkout not ready. You can complete payment from the order confirmation screen.',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.replace({
                    pathname: '/(screens)/order-confirmation',
                    params: {
                      orderId: orderResponse.order_id,
                      orderNumber: orderResponse.order_number,
                      arrivalCode: orderResponse.arrival_code,
                      total: total.toString(),
                      paymentMethod: paymentMethod,
                    },
                  } as never);
                },
              },
            ]
          );
          return;
        }
      }

      // Cash on Pickup flow or PayMongo fallback without checkout URL
      router.replace({
        pathname: '/(screens)/order-confirmation',
        params: {
          orderId: orderResponse.order_id,
          orderNumber: orderResponse.order_number,
          arrivalCode: orderResponse.arrival_code,
          total: total.toString(),
          paymentMethod: paymentMethod,
        },
      } as never);
    } catch (error: any) {
      console.error('[Checkout] Order creation failed:', error);
      
      let errorTitle = 'Order Failed';
      let errorMessage = 'Failed to create order. Please try again.';
      let showRetry = true;
      
      // Parse specific error types for better user guidance
      if (error.response?.data?.message) {
        const msg = error.response.data.message;
        errorMessage = msg;
        
        // Stock validation errors
        if (msg.includes('out of stock') || msg.includes('insufficient stock')) {
          errorTitle = 'Stock Issue';
          errorMessage = msg + '\n\nSome items are out of stock. Please review your cart and try again.';
          showRetry = false; // User needs to fix cart first
        }
        
        // Product unavailable errors
        if (msg.includes('unavailable') || msg.includes('not available')) {
          errorTitle = 'Product Unavailable';
          errorMessage = msg + '\n\nSome products are temporarily unavailable. Please remove them from your cart.';
          showRetry = false;
        }
        
        // Payment-related errors
        if (msg.includes('payment') && msg.includes('failed')) {
          errorTitle = 'Payment Error';
          errorMessage = 'Payment processing failed. You can retry payment from the order details screen.';
        }
        
        // Network or timeout errors
        if (error.code === 'ECONNABORTED' || msg.includes('timeout')) {
          errorTitle = 'Connection Timeout';
          errorMessage = 'Request timed out. Please check your internet connection and try again.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        errorTitle,
        errorMessage,
        [
          { text: 'OK', style: 'cancel' },
          ...(showRetry ? [
            {
              text: 'Retry',
              onPress: () => handlePlaceOrder(),
            }
          ] : []),
        ]
      );
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
                maximumDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)} // Today + 2 days
                onChange={handleDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={pickupDate}
                mode="time"
                display="default"
                minimumDate={new Date()} // Can't pick time earlier than now
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

            {/* PayMongo online payment option */}
            <Pressable
              style={[
                styles.paymentOption,
                {
                  borderColor: paymentMethod === 'paymongo' ? colors.primary : palette.border,
                  backgroundColor: paymentMethod === 'paymongo' ? `${colors.primary}10` : palette.bg,
                },
              ]}
              onPress={() => setPaymentMethod('paymongo')}
            >
              <Ionicons 
                name={paymentMethod === 'paymongo' ? 'radio-button-on' : 'radio-button-off'} 
                size={24} 
                color={paymentMethod === 'paymongo' ? colors.primary : palette.subText} 
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[{ fontSize: h4 }, { color: palette.text }]}>
                  Online Payment
                </Text>
                <Text style={[{ fontSize: bodySmall }, { color: palette.subText }]}>
                  GCash, Card, PayMaya, GrabPay
                </Text>
              </View>
              <Ionicons name="card-outline" size={24} color={colors.primary} />
            </Pressable>

            {/* Payment Method Type Selection - Only show when PayMongo is selected */}
            {paymentMethod === 'paymongo' && (
              <View style={{ marginTop: 12, paddingLeft: 12 }}>
                <Text style={[{ fontSize: body }, { color: palette.subText, marginBottom: 8 }]}>
                  Select Payment Method
                </Text>
                
                {/* GCash */}
                <Pressable
                  style={[
                    styles.paymentMethodType,
                    {
                      borderColor: paymentMethodType === 'gcash' ? colors.primary : palette.border,
                      backgroundColor: paymentMethodType === 'gcash' ? `${colors.primary}05` : 'transparent',
                    },
                  ]}
                  onPress={() => setPaymentMethodType('gcash')}
                >
                  <Ionicons
                    name={paymentMethodType === 'gcash' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={paymentMethodType === 'gcash' ? colors.primary : palette.subText}
                  />
                  <Text style={[{ fontSize: body }, { color: palette.text, marginLeft: 8 }]}>
                    GCash
                  </Text>
                </Pressable>

                {/* Card */}
                <Pressable
                  style={[
                    styles.paymentMethodType,
                    {
                      borderColor: paymentMethodType === 'card' ? colors.primary : palette.border,
                      backgroundColor: paymentMethodType === 'card' ? `${colors.primary}05` : 'transparent',
                    },
                  ]}
                  onPress={() => setPaymentMethodType('card')}
                >
                  <Ionicons
                    name={paymentMethodType === 'card' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={paymentMethodType === 'card' ? colors.primary : palette.subText}
                  />
                  <Text style={[{ fontSize: body }, { color: palette.text, marginLeft: 8 }]}>
                    Credit/Debit Card
                  </Text>
                </Pressable>

                {/* PayMaya */}
                <Pressable
                  style={[
                    styles.paymentMethodType,
                    {
                      borderColor: paymentMethodType === 'paymaya' ? colors.primary : palette.border,
                      backgroundColor: paymentMethodType === 'paymaya' ? `${colors.primary}05` : 'transparent',
                    },
                  ]}
                  onPress={() => setPaymentMethodType('paymaya')}
                >
                  <Ionicons
                    name={paymentMethodType === 'paymaya' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={paymentMethodType === 'paymaya' ? colors.primary : palette.subText}
                  />
                  <Text style={[{ fontSize: body }, { color: palette.text, marginLeft: 8 }]}>
                    PayMaya
                  </Text>
                </Pressable>

                {/* GrabPay */}
                <Pressable
                  style={[
                    styles.paymentMethodType,
                    {
                      borderColor: paymentMethodType === 'grab_pay' ? colors.primary : palette.border,
                      backgroundColor: paymentMethodType === 'grab_pay' ? `${colors.primary}05` : 'transparent',
                    },
                  ]}
                  onPress={() => setPaymentMethodType('grab_pay')}
                >
                  <Ionicons
                    name={paymentMethodType === 'grab_pay' ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={paymentMethodType === 'grab_pay' ? colors.primary : palette.subText}
                  />
                  <Text style={[{ fontSize: body }, { color: palette.text, marginLeft: 8 }]}>
                    GrabPay
                  </Text>
                </Pressable>
              </View>
            )}
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
  paymentMethodType: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
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
