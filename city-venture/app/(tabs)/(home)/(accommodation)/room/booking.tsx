import Button from '@/components/Button';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { createFullBooking } from '@/query/accommodationQuery';
import {
  initiateBookingPayment,
  mapPaymentMethodType,
} from '@/services/BookingPaymentService';
import { Booking, BookingPayment } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
// useNavigation: for setOptions (header customization)
// useRouter: for navigation actions (push, replace, back)
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import React, { useEffect } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Billing from './booking/Billing';
import BookingForm from './booking/BookingForm';
import Summary from './booking/Summary';
import { background } from '@/constants/color';

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
        setSubmitting(false);
        return;
      }

      // Validate required fields before initiating payment
      const validationError = validateBeforeSubmit();
      if (validationError) {
        Alert.alert('Cannot proceed', validationError);
        setSubmitting(false);
        return;
      }

      // Prepare booking data - booking will be created on backend
      const bookingPayload: Booking = {
        ...bookingData,
        room_id: roomDetails?.id,
        tourist_id: user?.id,
        balance: Number(bookingData.total_price) - Number(paymentData.amount),
      };

      // Map selected payment method to PayMongo type
      const paymentMethodType = mapPaymentMethodType(
        paymentData.payment_method || 'gcash'
      );

      debugLogger({
        title: 'Initiating Booking Payment with booking data',
        data: {
          amount: paymentData.amount,
          paymentMethodType,
          paymentType: paymentData.payment_type,
          bookingData: bookingPayload,
        },
      });

      // Call backend API to create booking and initiate payment
      // Use a temporary booking ID since booking will be created on backend
      const tempBookingId = 'pending_' + Date.now();

      try {
        const response = await initiateBookingPayment(tempBookingId, {
          payment_method_type: paymentMethodType,
          payment_type: paymentData.payment_type || 'Full Payment',
          amount: paymentData.amount,
          bookingData: bookingPayload, // Backend will create booking from this data
        });

        if (!response.success || !response.data?.checkout_url) {
          Alert.alert(
            'Payment',
            response.message || 'No checkout URL returned.'
          );
          setSubmitting(false);
          return;
        }

        const {
          checkout_url: checkoutUrl,
          payment_id,
          booking_id,
          booking_created,
        } = response.data;

        // Update local booking state with the created booking ID
        if (booking_id && booking_created) {
          setBookingData(
            (prev) =>
              ({
                ...prev,
                id: booking_id,
                booking_status: 'Reserved',
              } as Booking)
          );
        }

        debugLogger({
          title: 'Booking Payment Initiated',
          data: { checkoutUrl, payment_id, booking_id, booking_created },
          successMessage: 'Checkout session created successfully',
        });

        // Navigate to online payment screen with actual checkout URL
        router.push(
          Routes.accommodation.room.onlinePayment({
            checkoutUrl,
            successUrl: `${
              process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') ||
              'https://city-venture.com'
            }/bookings/${booking_id}/payment-success`,
            cancelUrl: `${
              process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') ||
              'https://city-venture.com'
            }/bookings/${booking_id}/payment-cancel`,
            payment_method: paymentMethodType,
            payment_id,
            // Pass booking data for reference
            bookingData: JSON.stringify({
              ...bookingPayload,
              id: booking_id,
              check_in_date: bookingData.check_in_date
                ? new Date(bookingData.check_in_date as any).toISOString()
                : undefined,
              check_out_date: bookingData.check_out_date
                ? new Date(bookingData.check_out_date as any).toISOString()
                : undefined,
            }),
            paymentData: JSON.stringify({
              ...paymentData,
              payment_method_type: paymentMethodType,
            }),
          })
        );
      } catch (apiError: any) {
        console.error('[Booking Payment API Error]', apiError);
        debugLogger({
          title: 'Booking Payment API Error',
          error: apiError?.response?.data || apiError,
          errorCode: apiError?.code || apiError?.response?.status,
        });

        const errorMsg =
          apiError?.response?.data?.message ||
          apiError?.response?.data?.error ||
          apiError?.message ||
          'Failed to initialize payment';

        Alert.alert(
          'Payment Error',
          errorMsg +
            (apiError?.response?.data?.details
              ? '\n\nPlease check your internet connection and try again.'
              : '')
        );
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error('[Booking Payment Error]', err);
      debugLogger({
        title: 'Booking Payment Error',
        error: err?.response?.data || err,
        errorCode: err?.code || err?.response?.status,
      });
      Alert.alert(
        'Payment error',
        err?.response?.data?.message ||
          err?.message ||
          'Failed to initialize online payment.'
      );
      setSubmitting(false);
    } finally {
      // Don't set submitting false here since navigation should handle it
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
  const isStepValid = (): boolean => {
    if (step === 'booking') {
      // Validate booking form fields
      const paxValid =
        typeof bookingData.pax === 'number' && bookingData.pax > 0;
      const datesValid =
        !!bookingData.check_in_date && !!bookingData.check_out_date;
      const tripPurposeValid =
        !!bookingData.trip_purpose &&
        bookingData.trip_purpose.trim().length > 0;

      // Check traveler type counts sum equals pax
      const travelerCountsSum =
        (bookingData.local_counts || 0) +
        (bookingData.domestic_counts || 0) +
        (bookingData.foreign_counts || 0) +
        (bookingData.overseas_counts || 0);
      const travelerCountsValid = travelerCountsSum > 0;

      return paxValid && datesValid && tripPurposeValid && travelerCountsValid;
    }

    if (step === 'payment') {
      // Validate payment fields
      const paymentMethodValid = !!paymentData.payment_method;
      const amountValid =
        typeof paymentData.amount === 'number' && paymentData.amount > 0;
      return paymentMethodValid && amountValid;
    }

    return true;
  };

  // Get validation message for current step
  const getValidationMessage = (): string | null => {
    if (step === 'booking') {
      if (typeof bookingData.pax !== 'number' || bookingData.pax < 1) {
        return 'Please enter number of guests (pax)';
      }
      if (!bookingData.check_in_date || !bookingData.check_out_date) {
        return 'Please select check-in and check-out dates';
      }
      if (
        !bookingData.trip_purpose ||
        bookingData.trip_purpose.trim().length === 0
      ) {
        return 'Please select a trip purpose';
      }
      const travelerCountsSum =
        (bookingData.local_counts || 0) +
        (bookingData.domestic_counts || 0) +
        (bookingData.foreign_counts || 0) +
        (bookingData.overseas_counts || 0);
      if (travelerCountsSum === 0) {
        return 'Please select at least one traveler type and enter count';
      }
    }

    if (step === 'payment') {
      if (!paymentData.payment_method) {
        return 'Please select a payment method';
      }
      if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
        return 'Invalid payment amount. Please check your booking details.';
      }
    }

    return null;
  };

  const colorScheme = useColorScheme();
  const bgColor = colorScheme === 'dark' ? background.dark : background.light;

  // Tab bar height approximation (adjust if needed)
  const TAB_BAR_HEIGHT = 60;

  return (
    <PageContainer padding={0}>
      <View style={{ flex: 1 }}>
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
                paddingBottom: baseBottom + insets.bottom + TAB_BAR_HEIGHT,
                paddingTop: Platform.OS === 'ios' ? 16 : 12,
                backgroundColor: bgColor,
              },
            ]}
          >
            <Button
              label={step === 'booking' ? 'Cancel' : 'Previous'}
              style={{ flex: 1 }}
              variant="outlined"
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
                if (submitting) return;

                // Validate before proceeding
                const validationMsg = getValidationMessage();
                if (validationMsg) {
                  Alert.alert('Incomplete Information', validationMsg);
                  return;
                }

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
    // Add shadow for visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
});
