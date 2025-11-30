/**
 * Payment Service
 * Handles payment status checking for PayMongo payments
 * For payment initiation, use PaymentIntentService instead (PIPM flow)
 * All PayMongo API calls are made through the backend for security
 */

import apiClient from '@/services/apiClient';
import * as Linking from 'expo-linking';

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  payment_method: string;
  payment_for: string;
  payment_for_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get payment status by payment ID
 * @param paymentId - Payment UUID
 * @returns Payment status details
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  try {
    const response = await apiClient.get<PaymentStatus>(
      `/payment/${paymentId}`
    );

    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Get payment status failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Handle deep link redirect from PayMongo
 * Call this when app receives a deep link after payment
 * @param url - Deep link URL
 * @returns Object with payment result information
 */
export async function handlePaymentRedirect(url: string): Promise<{
  type: 'success' | 'cancel' | 'unknown';
  orderId?: string;
  paymentId?: string;
}> {
  try {
    const parsed = Linking.parse(url);
    const { hostname, path, queryParams } = parsed;

    console.log('[PaymentService] Payment redirect:', { hostname, path, queryParams });

    // Expected URLs:
    // Success: cityventure://orders/{orderId}/payment-success
    // Cancel: cityventure://orders/{orderId}/payment-cancel

    if (path?.includes('payment-success')) {
      // Extract order ID from path
      const orderIdMatch = path.match(/orders\/([^\/]+)\/payment-success/);
      const orderId = orderIdMatch?.[1];

      return {
        type: 'success',
        orderId,
      };
    }

    if (path?.includes('payment-cancel')) {
      const orderIdMatch = path.match(/orders\/([^\/]+)\/payment-cancel/);
      const orderId = orderIdMatch?.[1];

      return {
        type: 'cancel',
        orderId,
      };
    }

    return { type: 'unknown' };
  } catch (error: any) {
    console.error('[PaymentService] Handle redirect failed:', error.message);
    return { type: 'unknown' };
  }
}

/**
 * Poll for payment status updates
 * Use this after returning from PayMongo checkout to check if payment was completed
 * @param paymentId - Payment UUID
 * @param maxAttempts - Maximum polling attempts (default 20)
 * @param intervalMs - Polling interval in milliseconds (default 2000 = 2s)
 * @returns Final payment status or throws after max attempts
 */
export async function pollPaymentStatus(
  paymentId: string,
  maxAttempts: number = 20,
  intervalMs: number = 2000
): Promise<PaymentStatus> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const status = await getPaymentStatus(paymentId);

      // Return immediately if payment is completed (success or failure)
      if (status.status === 'paid' || status.status === 'failed' || status.status === 'refunded') {
        return status;
      }

      // Wait before next attempt
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error: any) {
      console.error(`[PaymentService] Poll attempt ${attempt + 1} failed:`, error.message);
      
      // Continue polling even on error (payment might still be processing)
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
  }

  throw new Error('Payment status polling timeout - please check order status manually');
}

/**
 * Setup deep link listener for payment redirects
 * Call this in your app's root component to handle payment completions
 * @param onPaymentComplete - Callback when payment redirect is received
 */
export function setupPaymentDeepLinkListener(
  onPaymentComplete: (result: { type: 'success' | 'cancel'; orderId?: string }) => void
): () => void {
  const subscription = Linking.addEventListener('url', async (event) => {
    const result = await handlePaymentRedirect(event.url);
    
    if (result.type !== 'unknown') {
      onPaymentComplete(result as any);
    }
  });

  return () => subscription.remove();
}
