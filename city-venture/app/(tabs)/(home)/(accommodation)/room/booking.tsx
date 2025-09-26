import Button from '@/components/Button';
import PageContainer from '@/components/PageContainer';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { createFullBooking } from '@/query/accommodationQuery';
import { createCheckoutSession } from '@/services/PayMongoService';
import { Booking, BookingPayment, Guests } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
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
    foreign_counts: 0,
    domestic_counts: 0,
    overseas_counts: 0,
    local_counts: 1,
  });

  const [guestList, setGuestList] = React.useState<Guests>([]);
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
    if ((bookingData.pax || 0) < 1) return 'Please enter number of guests.';
    if (!paymentData.payment_method) return 'Please select a payment method.';
    if (!guestList || guestList.length === 0)
      return 'Please provide guest information.';
    if (guestList.length !== bookingData.pax)
      return 'Number of guests does not match guest information provided.';
    for (let i = 0; i < guestList.length; i++) {
      const g = guestList[i];
      if (!g.name || g.name.trim() === '')
        return `Guest #${i + 1} name is required.`;
      if (g.age === null || g.age === undefined || g.age < 0)
        return `Guest #${i + 1} age is required and must be non-negative.`;
      if (!g.gender || g.gender.trim() === '')
        return `Guest #${i + 1} gender is required.`;
    }

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
        booking_status: 'Pending',
        balance: bookingData.total_price,
      };
      const guestsPayload = guestList.map((g) => ({
        ...g,
        name: g.name,
        gender: g.gender,
        age: g.age,
      }));
      const paymentPayload: BookingPayment = {
        ...paymentData,
        payer_type: 'Tourist',
        payer_id: user?.id,
        payment_for_id: bookingPayload.room_id,
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
        title: 'Booking Submission: guestsPayload',
        data: guestsPayload,
      });
      debugLogger({
        title: 'Booking Submission: paymentPayload',
        data: paymentPayload,
      });

      const created = await createFullBooking(
        bookingPayload,
        guestsPayload,
        paymentPayload
      );
      debugLogger({
        title: 'Booking Submission: Success',
        data: created,
        successMessage: 'Booking successfully created.',
      });
      Alert.alert('Success', 'Booking successfully created.', created);
      navigation.goBack();
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
      if (!paymentData.amount || paymentData.amount <= 0) {
        Alert.alert('Payment', 'Invalid amount to charge.');
        return;
      }
      // Map selected payment method to Checkout payment method types
      const method = (paymentData.payment_method || '').toLowerCase();
      const supported = [
        'gcash',
        'paymaya',
        'grab_pay',
        'dob',
        'qrph',
        'card',
      ] as const;
      const type = supported.find((m) => method.includes(m)) || 'gcash';
      if (!type) {
        Alert.alert(
          'Payment',
          'Selected online payment method is not supported yet.'
        );
        return;
      }

      const successUrl = 'https://city-venture.com/payment/success';
      const cancelUrl = 'https://city-venture.com/payment/cancel';

      const checkout = await createCheckoutSession({
        description: 'Room Reservation Payment',
        payment_method_types: [type],
        billing: {
          name:
            `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() ||
            'Guest',
          email: user?.email || undefined,
          phone: user?.phone_number || undefined,
        },
        line_items: [
          {
            name: 'Room Reservation',
            amount: Math.round(paymentData.amount * 100),
            quantity: 1,
            currency: 'PHP',
            description: `${paymentData.payment_type}`,
          },
        ],
        send_email_receipt: true,
        show_description: true,
        show_line_items: true,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      const checkoutUrl = checkout?.attributes?.checkout_url;
      if (!checkoutUrl) {
        Alert.alert('Payment', 'No checkout URL returned.');
      } else {
        router.push({
          pathname: '/(tabs)/(home)/(accommodation)/room/booking/OnlinePayment',
          params: {
            checkoutUrl,
            successUrl,
            cancelUrl,
            payment_method: type,
            // pass booking data, billing/payment data and guest data as JSON strings
            bookingData: JSON.stringify({
              ...bookingData,
              check_in_date: bookingData.check_in_date
                ? new Date(bookingData.check_in_date as any).toISOString()
                : undefined,
              check_out_date: bookingData.check_out_date
                ? new Date(bookingData.check_out_date as any).toISOString()
                : undefined,
            }),
            guests: JSON.stringify(guestList || []),
            paymentData: JSON.stringify(paymentData || {}),
          },
        });
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'Payment error',
        err?.message || 'Failed to initialize online payment.'
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
      const guestsValid =
        guestList.length === bookingData.pax &&
        guestList.every(
          (g) =>
            g.name &&
            g.name.trim() &&
            g.gender &&
            g.gender.trim() &&
            g.age &&
            g.age > 0
        );
      return paxValid && adultsValid && tripPurposeValid && guestsValid;
    }
    if (step === 'payment') {
      return !!paymentData.payment_method;
    }
    if (step === 'summary') {
      return (
        guestList &&
        guestList.length === bookingData.pax &&
        guestList.every(
          (g) =>
            g.name &&
            g.name.trim() &&
            g.gender &&
            g.gender.trim() &&
            g.age &&
            g.age > 0
        )
      );
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
            guests={guestList}
            setGuests={setGuestList}
            payment={paymentData}
            setPayment={setPaymentData}
          />
        )}
        {step === 'payment' && (
          <Billing
            data={bookingData}
            setData={setBookingData}
            guests={guestList}
            setGuests={setGuestList}
            payment={paymentData}
            setPayment={setPaymentData}
          />
        )}
        {step === 'summary' && (
          <Summary
            data={bookingData}
            guests={guestList}
            payment={paymentData}
            setData={setBookingData}
            setGuests={setGuestList}
            setPayment={setPaymentData}
          />
        )}
      </View>

      {(() => {
        const baseBottom = Platform.OS === 'ios' ? 60 : 80;
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
              label="Previous"
              style={{ flex: 1 }}
              onPress={() => {
                if (step === 'payment') setStep('booking');
                else if (step === 'summary') {
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
