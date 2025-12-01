import { background } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { bookRoom, payBooking } from '@/query/accommodationQuery';
import { Booking, BookingPayment } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
import { notifyPayment } from '@/utils/paymentBus';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
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
    bookingData,
    guests,
    paymentData,
  } = useLocalSearchParams<Params>();
  const [creating, setCreating] = useState(false);
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

  const submitBooking = useCallback(async () => {
    if (creating) return;
    if (!roomDetails?.id || !user?.id) return;
    try {
      setCreating(true);
      const total = Number((parsed.b as Booking)?.total_price) || 0;
      const paid = Number((parsed.p as BookingPayment)?.amount) || 0;

      // Step 1: Create the booking first
      const bookingPayload: Booking = {
        ...(parsed.b as Booking),
        room_id: roomDetails.id,
        tourist_id: user.id,
        booking_status: 'Reserved',
        balance: Math.max(total - paid, 0),
      } as Booking;

      debugLogger({
        title: 'OnlinePayment: Creating booking',
        data: { bookingPayload },
      });

      const createdBooking = await bookRoom(bookingPayload);

      if (!createdBooking?.id) {
        throw new Error('Booking ID not returned after creation');
      }

      debugLogger({
        title: 'OnlinePayment: Booking created successfully',
        data: createdBooking,
      });

      // Step 2: Create the payment record with the booking ID
      const paymentPayload: BookingPayment = {
        ...(parsed.p as BookingPayment),
        payer_type: 'Tourist',
        payer_id: user.id,
        payment_for_id: createdBooking.id,
        payment_for: 'Reservation',
        status:
          parsed.p?.payment_type === 'Full Payment'
            ? 'Paid'
            : 'Pending Balance',
      } as BookingPayment;

      debugLogger({
        title: 'OnlinePayment: Creating payment',
        data: { paymentPayload },
      });

      await payBooking(createdBooking.id, paymentPayload, total);

      debugLogger({
        title: 'OnlinePayment: Full booking process completed',
        data: createdBooking,
        successMessage: 'Booking and payment successfully created.',
      });
    } catch (e: any) {
      debugLogger({
        title: 'OnlinePayment: Booking creation failed',
        error: e?.response?.data || e,
        errorCode: e?.code || e?.response?.status,
      });
      Alert.alert(
        'Booking',
        e?.response?.data?.message ||
          e?.message ||
          'Booking creation failed after payment.'
      );
    } finally {
      setCreating(false);
    }
  }, [creating, parsed, roomDetails?.id, user?.id]);

  const handleUrl = useCallback(
    (url: string) => {
      if (!url) return false;
      const lower = url.toLowerCase();

      // If redirecting back to provided https success/cancel pages, finish flow
      if (successUrl && lower.startsWith(successUrl.toLowerCase())) {
        notifyPayment('success');
        submitBooking().finally(() => {
          router.replace({
            pathname: '/(tabs)/(home)/(accommodation)/room/booking/Summary',
            params: {
              bookingData: bookingData || '',
              guests: guests || '',
              paymentData: paymentData || '',
            },
          });
        });
        return false;
      }
      if (cancelUrl && lower.startsWith(cancelUrl.toLowerCase())) {
        notifyPayment('cancel');
        router.replace({
          pathname: '/(tabs)/(home)/(accommodation)/room/booking/Billing',
          params: {
            bookingData: bookingData || '',
            guests: guests || '',
            paymentData: paymentData || '',
          },
        });
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
      submitBooking,
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
