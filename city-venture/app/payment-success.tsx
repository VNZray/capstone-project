/**
 * Payment Success Screen (Expo Go compatible route)
 * Handles: exp://HOST/--/payment-success?orderId=X
 */

import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';

export default function PaymentSuccessRedirect() {
  const params = useLocalSearchParams<{ orderId?: string }>();

  useEffect(() => {
    // Redirect to the actual payment-success screen
    if (params.orderId) {
      router.replace({
        pathname: '/(screens)/payment-success',
        params: { orderId: params.orderId },
      } as never);
    } else {
      console.error('[PaymentSuccessRedirect] Missing orderId parameter');
      router.replace('/(tabs)/(home)' as never);
    }
  }, [params.orderId]);

  return null; // This is just a redirect wrapper
}
