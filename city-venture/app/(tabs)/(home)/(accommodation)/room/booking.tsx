import Button from '@/components/Button';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { createFullBooking } from '@/query/accommodationQuery';
import { initiateBookingPayment, mapPaymentMethodType } from '@/services/BookingPaymentService';
import { Booking, BookingPayment } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
// useNavigation: for setOptions (header customization)
// useRouter: for navigation actions (push, replace, back)
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import React, { useEffect } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Billing from './booking/Billing';
import BookingForm from './booking/BookingForm';
import Summary from './booking/Summary';

const booking = () => {
  const insets = useSafeAreaInsets();
  const { roomDetails } = useRoom();
  const { user } = useAuth();
  const navigation = useNavigation();
  const router = useRouter();
  const { paymentSuccess } = useLocalSearchParams<{
    paymentSuccess?: string;
  }>();

  const [step, setStep] = React.useState<
    'booking' | 'payment' | 'online' | 'summary'
  >('booking');
  const [bookingData, setBookingData] = React.useState<Booking>({
    pax: 1,
    num_adults: 1,
    num_children: 0,
    num_infants: 0,
    foreign_counts: 0,
    domestic_counts: 0,
    overseas_counts: 0,
    local_counts: 1,
    business_id: roomDetails?.business_id,
  });

  const [paymentData, setPaymentData] = React.useState<BookingPayment>({
    payment_type: 'Full Payment',
    amount: 0,
  });

  const [submitting, setSubmitting] = React.useState(false);

  const validateBeforeSubmit = (): string | null => {
    if (!roomDetails?.id) return 'Room not loaded.';
    if (!user?.id) return 'User not authenticated.';
    if (!bookingData.check_in_date || !bookingData.check_out_date)
      return 'Select check-in and check-out dates.';
    if ((bookingData.pax || 0) < 1) return 'Please enter number of pax.';
    if (!paymentData.payment_method) return 'Please select a payment method.';
    return null;
  };

  const sendBookingConfirmation = async () => {
    if (submitting) return;
    const validationError = validateBeforeSubmit();
    if (validationError) {
      Alert.alert('Cannot submit', validationError);
      return;
    }
    try {
      setSubmitting(true);
      const bookingPayload: Booking = {
        ...bookingData,
        room_id: roomDetails?.id,
        tourist_id: user?.id,
        // Set booking_status depending on payment method: non-cash => Reserved, cash => Pending
        booking_status:
          paymentData.payment_method && paymentData.payment_method !== 'Cash'
            ? 'Reserved'
            : 'Pending',
        balance: Number(bookingData.total_price) - Number(paymentData.amount),
      };
      // Removed guestsPayload
      const paymentPayload: BookingPayment = {
        ...paymentData,
        payer_type: 'Tourist',
        payer_id: user?.id,
        payment_for: 'Reservation',
        status:
          paymentData.payment_type === 'Full Payment'
            ? 'Paid'
            : 'Pending Balance',
      };

      debugLogger({
        title: 'Booking Submission: bookingPayload',
        data: bookingPayload,
      });
      debugLogger({
        title: 'Booking Submission: paymentPayload',
        data: paymentPayload,
      });

      const created = await createFullBooking(
        bookingPayload,
        paymentData.payment_method === 'Cash' ? undefined : paymentPayload
      );
      debugLogger({
        title: 'Booking Submission: Success',
        data: created,
        successMessage: 'Booking successfully created.',
      });
      // Update local booking state with returned id/status if present
      if (created?.id) {
        setBookingData(
          (prev) =>
            ({
              ...prev,
              id: created.id,
              booking_status: created.booking_status || prev.booking_status,
            } as Booking)
        );
      }
      if (paymentData.payment_method === 'Cash') {
        setStep('summary');
      } else {
        Alert.alert('Success', 'Booking successfully created.', created);
        navigation.goBack();
      }
    } catch (e: any) {
      debugLogger({
        title: 'Booking Submission: Error',
        error: e?.response?.data || e,
        errorCode: e?.code || e?.response?.status,
      });
      Alert.alert(
        'Error',
        e?.response?.data?.message || e.message || 'Failed to create booking'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const processPayment = async () => {
    try {
      setSubmitting(true);
      
      // Validate amount
      if (!paymentData.amount || paymentData.amount <= 0) {
        Alert.alert('Payment', 'Invalid amount to charge.');
        return;
      }
      
      // Validate booking has been created (needs booking ID)
      if (!bookingData.id) {
        Alert.alert('Payment', 'Please complete booking first before proceeding to payment.');
        return;
      }
      
      // Map selected payment method to PayMongo type
      const paymentMethodType = mapPaymentMethodType(paymentData.payment_method || 'gcash');
      
      debugLogger({
        title: 'Initiating Booking Payment',
        data: { 
          bookingId: bookingData.id, 
          amount: paymentData.amount, 
          paymentMethodType,
          paymentType: paymentData.payment_type 
        },
      });

      // Call backend to create PayMongo checkout session
      const response = await initiateBookingPayment(bookingData.id, {
        payment_method_type: paymentMethodType,
        payment_type: paymentData.payment_type || 'Full Payment',
        amount: paymentData.amount,
      });

      if (!response.success || !response.data?.checkout_url) {
        Alert.alert('Payment', response.message || 'No checkout URL returned.');
        return;
      }

      const { checkout_url: checkoutUrl, payment_id } = response.data;
      
      debugLogger({
        title: 'Booking Payment Initiated',
        data: { checkoutUrl, payment_id },
        successMessage: 'Checkout session created successfully',
      });

      // Navigate to online payment screen with checkout URL
      router.push(Routes.accommodation.room.onlinePayment({
        checkoutUrl,
        successUrl: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'https://city-venture.com'}/bookings/${bookingData.id}/payment-success`,
        cancelUrl: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'https://city-venture.com'}/bookings/${bookingData.id}/payment-cancel`,
        payment_method: paymentMethodType,
        payment_id,
        // pass booking data, billing/payment data as JSON strings
        bookingData: JSON.stringify({
          ...bookingData,
          check_in_date: bookingData.check_in_date
            ? new Date(bookingData.check_in_date as any).toISOString()
            : undefined,
          check_out_date: bookingData.check_out_date
            ? new Date(bookingData.check_out_date as any).toISOString()
            : undefined,
        }),
        paymentData: JSON.stringify(paymentData || {}),
      }));
    } catch (err: any) {
      console.error('[Booking Payment Error]', err);
      debugLogger({
        title: 'Booking Payment Error',
        error: err?.response?.data || err,
        errorCode: err?.code || err?.response?.status,
      });
      Alert.alert(
        'Payment error',
        err?.response?.data?.message || err?.message || 'Failed to initialize online payment.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    step === 'booking' && navigation.setOptions({ title: 'Booking' });
    step === 'payment' && navigation.setOptions({ title: 'Billings' });
    step === 'online' && navigation.setOptions({ title: 'Online Payment' });
    step === 'summary' && navigation.setOptions({ title: 'Summary' });
  }, [step, navigation]);

  // When returning from OnlinePayment with success, jump to Summary
  useEffect(() => {
    if (paymentSuccess === '1') {
      setStep('summary');
    }
  }, [paymentSuccess]);

  // Helper to determine if the current step's required fields are filled
  const isStepValid = () => {
    if (step === 'booking') {
      // Validate booking form fields: pax, num_adults, num_children, trip_purpose, guest info
      const paxValid =
        typeof bookingData.pax === 'number' && bookingData.pax > 0;
      const adultsValid =
        typeof bookingData.num_adults === 'number' &&
        bookingData.num_adults > 0;
      // children can be 0 or more
      const tripPurposeValid =
        bookingData.trip_purpose && bookingData.trip_purpose.trim().length > 0;
      // If guests are being filled in this step, check their validity
    }
    return true;
  };

  return (
    <PageContainer padding={0}>
      <View>
        {step === 'booking' && (
          <BookingForm
            data={bookingData}
            setData={setBookingData}
            payment={paymentData}
            setPayment={setPaymentData}
          />
        )}
        {step === 'payment' && (
          <Billing
            data={bookingData}
            setData={setBookingData}
            payment={paymentData}
            setPayment={setPaymentData}
          />
        )}
        {step === 'summary' && (
          <Summary
            data={bookingData}
            payment={paymentData}
            setData={setBookingData}
            setPayment={setPaymentData}
          />
        )}
      </View>

      {(() => {
        const baseBottom = Platform.OS === 'ios' ? 0 : 12;
        return (
          <View
            style={[
              styles.fabBar,
              {
                paddingBottom: baseBottom + insets.bottom,
                paddingTop: Platform.OS === 'ios' ? 16 : 12,
              },
            ]}
          >
            <Button
              label={step === 'booking' ? 'Cancel' : 'Previous'}
              style={{ flex: 1 }}
              onPress={() => {
                if (step === 'booking') {
                  navigation.goBack();
                } else if (step === 'payment') {
                  setStep('booking');
                } else if (step === 'summary') {
                  if (paymentData.payment_method === 'Cash') setStep('payment');
                  else setStep('online');
                }
              }}
            />

            <Button
              label={
                step === 'booking'
                  ? 'Proceed to Payment'
                  : step === 'payment'
                  ? paymentData.payment_method === 'Cash'
                    ? 'Confirm Booking'
                    : 'Process Payment'
                  : step === 'summary'
                  ? 'Finish Booking'
                  : submitting
                  ? 'Submitting...'
                  : 'Finish Booking'
              }
              fullWidth
              color="primary"
              variant="solid"
              elevation={3}
              style={{
                flex: 1,
                opacity: submitting || !isStepValid() ? 0.6 : 1,
              }}
              disabled={submitting || !isStepValid()}
              onPress={() => {
                if (submitting || !isStepValid()) return;
                if (step === 'booking') {
                  setStep('payment');
                } else if (step === 'payment') {
                  if (paymentData.payment_method === 'Cash') {
                    // Confirm booking immediately for cash payments
                    sendBookingConfirmation();
                  } else {
                    // Start online payment
                    processPayment();
                  }
                } else if (step === 'online') {
                  setStep('summary');
                } else if (step === 'summary') {
                  sendBookingConfirmation();
                }
              }}
            />
          </View>
        );
      })()}
    </PageContainer>
  );
};

export default booking;

const styles = StyleSheet.create({
  fabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    // subtle backdrop & blur alternative (blur not added by default RN)
  },
});
