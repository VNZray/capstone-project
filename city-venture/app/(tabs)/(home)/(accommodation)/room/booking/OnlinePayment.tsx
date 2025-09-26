import { background } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { createFullBooking } from '@/query/accommodationQuery';
import { Booking, BookingPayment, Guests } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
import { notifyPayment } from '@/utils/paymentBus';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Modal, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    let g: Guests = [];
    let p: Partial<BookingPayment> = {};
    try {
      if (bookingData) b = JSON.parse(String(bookingData));
    } catch {}
    try {
      if (guests) g = JSON.parse(String(guests));
    } catch {}
    try {
      if (paymentData) p = JSON.parse(String(paymentData));
    } catch {}
    return { b, g, p } as { b: Partial<Booking>; g: Guests; p: Partial<BookingPayment> };
  }, [bookingData, guests, paymentData]);

  const submitBooking = useCallback(async () => {
    if (creating) return;
    if (!roomDetails?.id || !user?.id) return;
    try {
      setCreating(true);
      const bookingPayload: Booking = {
        ...(parsed.b as Booking),
        room_id: roomDetails.id,
        tourist_id: user.id,
        booking_status: 'Pending',
        balance: (parsed.b as Booking)?.total_price,
      } as Booking;
      const guestsPayload = (parsed.g || []).map((g: any) => ({
        ...g,
        name: g.name,
        gender: g.gender,
        age: g.age,
      }));
      const paymentPayload: BookingPayment = {
        ...(parsed.p as BookingPayment),
        payer_type: 'Tourist',
        payer_id: user.id,
        payment_for_id: bookingPayload.room_id,
        payment_for: 'Reservation',
        status:
          parsed.p?.payment_type === 'Full Payment' ? 'Paid' : 'Pending Balance',
      } as BookingPayment;

      debugLogger({ title: 'OnlinePayment: Auto submit booking (payloads)', data: { bookingPayload, guestsPayload, paymentPayload } });
      const created = await createFullBooking(bookingPayload, guestsPayload, paymentPayload);
      debugLogger({ title: 'OnlinePayment: Booking created after payment success', data: created, successMessage: 'Booking successfully created.' });
    } catch (e: any) {
      debugLogger({ title: 'OnlinePayment: Booking creation failed', error: e?.response?.data || e, errorCode: e?.code || e?.response?.status });
      Alert.alert('Booking', e?.response?.data?.message || e?.message || 'Booking creation failed after payment.');
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
    [router, successUrl, cancelUrl, submitBooking, bookingData, guests, paymentData]
  );

  if (!checkoutUrl) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }
  const colorScheme = useColorScheme();
  const bg = colorScheme === 'dark' ? background.dark : background.light;

  return (
    <Modal visible={true} animationType="fade">
      <SafeAreaView style={{ flex: 1 }}>
        <WebView
          ref={webviewRef}
          source={{ uri: checkoutUrl as string }}
          startInLoadingState={true}
          onShouldStartLoadWithRequest={(req) => handleUrl(req.url)}
          javaScriptEnabled={true}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default OnlinePayment;

const styles = StyleSheet.create({});
