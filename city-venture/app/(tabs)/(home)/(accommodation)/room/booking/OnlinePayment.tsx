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

      // If redirecting back to provided https success/cancel pages, finish flow
      if (successUrl && lower.startsWith(successUrl.toLowerCase())) {
        notifyPayment('success');
        updatePaymentStatus().finally(() => {
          router.replace(Routes.accommodation.room.summary({
            bookingData: bookingData || '',
            guests: guests || '',
            paymentData: paymentData || '',
          }));
        });
        return false;
      }
      if (cancelUrl && lower.startsWith(cancelUrl.toLowerCase())) {
        notifyPayment('cancel');
        router.replace(Routes.accommodation.room.billing({
          bookingData: bookingData || '',
          guests: guests || '',
          paymentData: paymentData || '',
        }));
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
      router,
      successUrl,
      cancelUrl,
      updatePaymentStatus,
      bookingData,
      guests,
      paymentData,
    ]
  );

  if (!checkoutUrl) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }
  const colorScheme = useColorScheme();
  const bg = colorScheme === 'dark' ? background.dark : background.light;

  return (
    <Modal visible={true} animationType="fade">
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
  );
};

export default OnlinePayment;

const styles = StyleSheet.create({});
