import { background } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { payBooking } from '@/query/accommodationQuery';
import { Booking, BookingPayment } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
import { notifyPayment } from '@/utils/paymentBus';
// useNavigation: for setOptions (header customization)
// useRouter: for navigation actions (push, replace, back)
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Linking,
  Modal,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import BookingPaymentResultModal, { 
  type PaymentResultStatus 
} from './modal/BookingPaymentResultModal';

type Params = {
  checkoutUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
  amount?: string;
  payment_method?: string;
  payment_id?: string;
  bookingData?: string;
  guests?: string;
  paymentData?: string;
};

const OnlinePayment = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useAuth();
  const { roomDetails } = useRoom();
  const {
    checkoutUrl,
    successUrl,
    cancelUrl,
    payment_method,
    payment_id,
    bookingData,
    guests,
    paymentData,
  } = useLocalSearchParams<Params>();
  const [processing, setProcessing] = useState(false);
  const [paymentResultStatus, setPaymentResultStatus] = useState<PaymentResultStatus>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    navigation.setOptions({ title: payment_method || 'Online Payment' });
  }, [navigation, payment_method]);

  const parsed = useMemo(() => {
    let b: Partial<Booking> = {};
    let p: Partial<BookingPayment> = {};
    try {
      if (bookingData) b = JSON.parse(String(bookingData));
    } catch {}
    try {
      if (paymentData) p = JSON.parse(String(paymentData));
    } catch {}
    return { b, p } as {
      b: Partial<Booking>;
      p: Partial<BookingPayment>;
    };
  }, [bookingData, guests, paymentData]);

  /**
   * Update the payment status after successful PayMongo payment
   * The booking was already created before navigating to this screen
   */
  const updatePaymentStatus = useCallback(async () => {
    if (processing) return;
    
    const bookingId = parsed.b?.id;
    if (!bookingId || !user?.id) {
      debugLogger({
        title: 'OnlinePayment: Missing booking ID or user',
        error: { bookingId, userId: user?.id },
      });
      return;
    }
    
    try {
      setProcessing(true);
      const total = Number((parsed.b as Booking)?.total_price) || 0;
      const paid = Number((parsed.p as BookingPayment)?.amount) || 0;

      // Create the payment record for the existing booking
      const paymentPayload: BookingPayment = {
        ...(parsed.p as BookingPayment),
        payer_type: 'Tourist',
        payer_id: user.id,
        payment_for_id: bookingId,
        payment_for: 'Reservation',
        status:
          parsed.p?.payment_type === 'Full Payment'
            ? 'Paid'
            : 'Pending Balance',
      } as BookingPayment;

      debugLogger({
        title: 'OnlinePayment: Recording payment',
        data: { bookingId, paymentPayload },
      });

      await payBooking(bookingId, paymentPayload, total);

      debugLogger({
        title: 'OnlinePayment: Payment recorded successfully',
        data: { bookingId },
        successMessage: 'Payment completed successfully.',
      });
    } catch (e: any) {
      debugLogger({
        title: 'OnlinePayment: Payment recording failed',
        error: e?.response?.data || e,
        errorCode: e?.code || e?.response?.status,
      });
      // Don't show alert here as payment was successful on PayMongo side
      // The webhook should handle the payment status update
      console.error('Failed to record payment locally:', e?.message);
    } finally {
      setProcessing(false);
    }
  }, [processing, parsed, user?.id]);

  const handleUrl = useCallback(
    (url: string) => {
      if (!url) return false;
      const lower = url.toLowerCase();

      // If redirecting back to provided https success/cancel pages, show modal
      if (successUrl && lower.startsWith(successUrl.toLowerCase())) {
        notifyPayment('success');
        updatePaymentStatus().finally(() => {
          // Show success modal instead of navigating away
          setPaymentResultStatus('success');
        });
        return false;
      }
      if (cancelUrl && lower.startsWith(cancelUrl.toLowerCase())) {
        notifyPayment('cancel');
        // Show cancelled modal instead of navigating away
        setPaymentResultStatus('cancelled');
        return false;
      }

      // Intercept wallet deep links and try to open app
      if (
        lower.startsWith('gcash://') ||
        lower.startsWith('paymaya://') ||
        lower.startsWith('grabpay://') ||
        lower.startsWith('intent://')
      ) {
        Linking.openURL(url).catch(() => undefined);
        return false; // don't load inside webview
      }
      return true; // allow WebView to load
    },
    [
      successUrl,
      cancelUrl,
      updatePaymentStatus,
    ]
  );

  if (!checkoutUrl) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }
  const colorScheme = useColorScheme();
  const bg = colorScheme === 'dark' ? background.dark : background.light;

  // Handlers for payment result modal
  const handleViewBooking = useCallback(() => {
    // Navigate to bookings list - use dismissAll first then navigate
    router.dismissAll();
    // Small delay to ensure navigation stack is clear
    setTimeout(() => {
      router.push('/(tabs)/(profile)/(bookings)');
    }, 100);
  }, [router]);

  const handleBackToHome = useCallback(() => {
    // Navigate to home - dismiss all and go to root tabs
    router.dismissAll();
    setTimeout(() => {
      router.replace('/(tabs)/(home)');
    }, 100);
  }, [router]);

  const handleRetryPayment = useCallback(() => {
    // Close modal and let user try again from billing screen
    setPaymentResultStatus(null);
    setErrorMessage(undefined);
    router.replace(Routes.accommodation.room.billing({
      bookingData: bookingData || '',
      guests: guests || '',
      paymentData: paymentData || '',
    }));
  }, [router, bookingData, guests, paymentData]);

  const handleCloseModal = useCallback(() => {
    setPaymentResultStatus(null);
    setErrorMessage(undefined);
  }, []);

  return (
    <>
      <Modal visible={paymentResultStatus === null} animationType="fade">
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <WebView
              ref={webviewRef}
              source={{ uri: checkoutUrl as string }}
              startInLoadingState={true}
              onShouldStartLoadWithRequest={(req) => handleUrl(req.url)}
              javaScriptEnabled={true}
            />
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>

      {/* Payment Result Modal */}
      <BookingPaymentResultModal
        status={paymentResultStatus}
        onClose={handleCloseModal}
        onViewBooking={handleViewBooking}
        onBackToHome={handleBackToHome}
        onRetryPayment={handleRetryPayment}
        bookingDetails={{
          bookingId: parsed.b?.id,
          roomName: roomDetails?.room_type || roomDetails?.room_number,
          checkInDate: parsed.b?.check_in_date as string | undefined,
          checkOutDate: parsed.b?.check_out_date as string | undefined,
          totalAmount: Number(parsed.p?.amount) || Number(parsed.b?.total_price),
        }}
        errorMessage={errorMessage}
      />
    </>
  );
};

export default OnlinePayment;

const styles = StyleSheet.create({});
