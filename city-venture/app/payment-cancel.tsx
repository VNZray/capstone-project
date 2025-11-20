/**
 * Payment Cancel Screen (Expo Go compatible route)
 * Handles: exp://HOST/--/payment-cancel?orderId=X
 */

import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';

export default function PaymentCancelRedirect() {
  const params = useLocalSearchParams<{ orderId?: string }>();

  useEffect(() => {
    // Redirect to the actual payment-cancel screen
    if (params.orderId) {
      router.replace({
        pathname: '/(screens)/payment-cancel',
        params: { orderId: params.orderId },
      } as never);
    } else {
      console.error('[PaymentCancelRedirect] Missing orderId parameter');
      router.replace('/(tabs)/(home)' as never);
    }
  }, [params.orderId]);

  return null; // This is just a redirect wrapper
}
