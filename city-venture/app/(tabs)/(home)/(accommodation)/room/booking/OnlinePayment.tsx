import { background } from '@/constants/color';
import { useAuth } from '@/context/AuthContext';
import { useRoom } from '@/context/RoomContext';
import { verifyBookingPayment } from '@/services/BookingPaymentService';
import { Booking, BookingPayment } from '@/types/Booking';
import debugLogger from '@/utils/debugLogger';
import { notifyPayment } from '@/utils/paymentBus';
import { ThemedText } from '@/components/themed-text';
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
  type PaymentResultStatus,
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
  const [paymentResultStatus, setPaymentResultStatus] =
    useState<PaymentResultStatus>(null);
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
   * Verify payment status with PayMongo via backend API
   * This checks the actual Payment Intent status to confirm success/failure
   */
  const verifyAndUpdatePayment = useCallback(async (): Promise<
    'success' | 'failed' | 'processing'
  > => {
    if (processing) return 'processing';

    const bookingId = parsed.b?.id;
    if (!bookingId || !user?.id || !payment_id) {
      debugLogger({
        title: 'OnlinePayment: Missing booking ID, user, or payment ID',
        error: { bookingId, userId: user?.id, payment_id },
      });
      setErrorMessage('Missing payment information. Please try again.');
      return 'failed';
    }

    try {
      setProcessing(true);

      debugLogger({
        title: 'OnlinePayment: Verifying payment status with PayMongo',
        data: { bookingId, payment_id },
      });

      // Call backend to verify actual PayMongo payment status
      const response = await verifyBookingPayment(bookingId, payment_id);

      debugLogger({
        title: 'OnlinePayment: Verification response',
        data: response.data,
      });

      const { verified, payment_status, message, last_payment_error } =
        response.data;

      if (verified && payment_status === 'success') {
        // Payment was actually successful!
        debugLogger({
          title: 'OnlinePayment: Payment verified as successful',
          data: { bookingId },
          successMessage: 'Payment completed successfully.',
        });
        return 'success';
      } else if (payment_status === 'failed') {
        // Payment failed or was cancelled
        setErrorMessage(
          last_payment_error?.message ||
            message ||
            'Payment was declined. Please try again.'
        );
        return 'failed';
      } else if (payment_status === 'processing') {
        // Still processing - could be webhook delay
        setErrorMessage('Payment is still being processed. Please wait...');
        return 'processing';
      } else {
        // Pending or unknown status
        setErrorMessage(
          message ||
            'Payment verification failed. Please check your booking status.'
        );
        return 'failed';
      }
    } catch (e: any) {
      debugLogger({
        title: 'OnlinePayment: Payment verification failed',
        error: e?.response?.data || e,
        errorCode: e?.code || e?.response?.status,
      });
      setErrorMessage(
        e?.response?.data?.message ||
          'Failed to verify payment. Please check your booking status.'
      );
      return 'failed';
    } finally {
      setProcessing(false);
    }
  }, [processing, parsed, user?.id, payment_id]);

  const handleUrl = useCallback(
    (url: string) => {
      if (!url) return false;
      const lower = url.toLowerCase();

      // Parse URL to check for status indicators
      let urlObj: URL | null = null;
      try {
        urlObj = new URL(url);
      } catch {
        // Invalid URL, continue with string matching
      }

      // Check for explicit failure indicators in URL
      const hasFailureIndicator =
        lower.includes('failed') ||
        lower.includes('failure') ||
        lower.includes('error') ||
        lower.includes('declined') ||
        urlObj?.searchParams.get('status') === 'failed' ||
        urlObj?.searchParams.get('payment_status') === 'failed';

      // If redirecting to cancel URL OR has failure indicators, show failed modal immediately
      if (cancelUrl && lower.startsWith(cancelUrl.toLowerCase())) {
        notifyPayment('cancel');
        setPaymentResultStatus('cancelled');
        return false;
      }

      // Check for success URL - but we need to VERIFY the actual payment status
      if (successUrl && lower.startsWith(successUrl.toLowerCase())) {
        // If URL contains explicit failure indicators, show failed immediately
        if (hasFailureIndicator) {
          notifyPayment('cancel');
          setErrorMessage('Payment was declined or failed. Please try again.');
          setPaymentResultStatus('failed');
          return false;
        }

        // Otherwise verify the actual payment status with PayMongo
        // This is critical - don't assume success just because we got redirected!
        verifyAndUpdatePayment().then((result) => {
          if (result === 'success') {
            notifyPayment('success');
            setPaymentResultStatus('success');
          } else if (result === 'processing') {
            // Payment still processing - show a processing state or wait
            // For now, we'll check again after a delay
            setTimeout(async () => {
              const retryResult = await verifyAndUpdatePayment();
              if (retryResult === 'success') {
                notifyPayment('success');
                setPaymentResultStatus('success');
              } else {
                notifyPayment('cancel');
                setPaymentResultStatus('failed');
              }
            }, 2000);
          } else {
            notifyPayment('cancel');
            setPaymentResultStatus('failed');
          }
        });
        return false;
      }

      // Also check for PayMongo's direct failure redirects
      if (hasFailureIndicator) {
        notifyPayment('cancel');
        setErrorMessage(
          'Payment was declined. Please try again with a different payment method.'
        );
        setPaymentResultStatus('failed');
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
    [successUrl, cancelUrl, verifyAndUpdatePayment]
  );

  const colorScheme = useColorScheme();
  const bg = colorScheme === 'dark' ? background.dark : background.light;

  if (!checkoutUrl) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: bg,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <ThemedText
          type="title-medium"
          style={{ marginBottom: 16, textAlign: 'center' }}
        >
          Loading Payment...
        </ThemedText>
        <ThemedText
          type="body-medium"
          style={{ textAlign: 'center', opacity: 0.7 }}
        >
          Please wait while we prepare your payment session.
        </ThemedText>
      </View>
    );
  }

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
    router.replace(
      Routes.accommodation.room.billing({
        bookingData: bookingData || '',
        guests: guests || '',
        paymentData: paymentData || '',
      })
    );
  }, [router, bookingData, guests, paymentData]);

  const handleCloseModal = useCallback(() => {
    setPaymentResultStatus(null);
    setErrorMessage(undefined);
  }, []);

  // Handle WebView messages from injected JavaScript
  const handleWebViewMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        debugLogger({
          title: 'WebView Message',
          data,
        });

        if (data.type === 'PAGE_TITLE' && data.title) {
          const titleLower = data.title.toLowerCase();
          // Check title for failure indicators
          if (
            titleLower.includes('failed') ||
            titleLower.includes('declined') ||
            titleLower.includes('error') ||
            titleLower.includes('unsuccessful') ||
            titleLower.includes('cancelled')
          ) {
            notifyPayment('cancel');
            setErrorMessage('Payment was declined by your payment provider.');
            setPaymentResultStatus('failed');
          }
        }
      } catch {
        // Ignore non-JSON messages
      }
    },
    []
  );

  // Inject script to send page title back to React Native
  const injectedJavaScript = `
    (function() {
      // Send initial title
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAGE_TITLE', title: document.title, url: window.location.href }));

      // Monitor for title changes
      var observer = new MutationObserver(function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAGE_TITLE', title: document.title, url: window.location.href }));
      });
      observer.observe(document.querySelector('title') || document.head, { subtree: true, characterData: true, childList: true });
    })();
    true;
  `;

  // WebView props with message handling for payment status detection
  const webViewProps = {
    ref: webviewRef,
    source: { uri: checkoutUrl as string },
    startInLoadingState: true,
    onShouldStartLoadWithRequest: (req: { url: string }) => handleUrl(req.url),
    onMessage: handleWebViewMessage,
    injectedJavaScript: injectedJavaScript,
    javaScriptEnabled: true,
  };

  return (
    <>
      <Modal visible={paymentResultStatus === null} animationType="fade">
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <WebView {...webViewProps} />
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
          totalAmount:
            Number(parsed.p?.amount) || Number(parsed.b?.total_price),
        }}
        errorMessage={errorMessage}
      />
    </>
  );
};

export default OnlinePayment;

const styles = StyleSheet.create({});
