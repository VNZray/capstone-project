/**
 * Payment Service
 * Handles payment initiation and status checking for PayMongo payments
 * All PayMongo API calls are made through the backend for security
 */

import axios from 'axios';
import api from './api';
import { ensureValidToken } from './AuthService';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export interface InitiatePaymentRequest {
  order_id: string;
  use_checkout_session?: boolean; // Default true
}

export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: string;
    order_id: string;
    order_number: string;
    amount: number;
    currency: string;
    payment_method_type: string;
    provider_reference: string; // Checkout session or source ID
    checkout_url: string; // URL to redirect user for payment
    status: string;
  };
}

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
 * Initiate payment for an order
 * This creates a PayMongo checkout session via the backend
 * @param paymentData - Payment initiation payload
 * @returns Payment response with checkout URL
 */
export async function initiatePayment(
  paymentData: InitiatePaymentRequest
): Promise<InitiatePaymentResponse> {
  try {
    const token = await ensureValidToken();
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await axios.post<InitiatePaymentResponse>(
      `${api}/payments/initiate`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Initiate payment failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get payment status by payment ID
 * @param paymentId - Payment UUID
 * @returns Payment status details
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  try {
    const token = await ensureValidToken();
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const response = await axios.get<PaymentStatus>(
      `${api}/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('[PaymentService] Get payment status failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Open PayMongo checkout URL in browser
 * Opens the hosted checkout page for the user to complete payment
 * @param checkoutUrl - PayMongo checkout URL
 * @returns Promise that resolves when browser is closed
 */
export async function openPayMongoCheckout(checkoutUrl: string): Promise<void> {
  try {
    // Open PayMongo checkout in an in-app browser
    const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      // toolbarColor and controlsColor are iOS-only
      toolbarColor: '#0D1B2A',
      controlsColor: '#FFFFFF',
    });

    console.log('[PaymentService] Browser result:', result);

    // Result types:
    // - 'cancel': User closed the browser
    // - 'dismiss': Same as cancel on iOS
    // - 'locked': Browser was locked (iOS)

    // Note: PayMongo will redirect to success_url or cancel_url
    // We need to handle these URLs when the app is reopened
  } catch (error: any) {
    console.error('[PaymentService] Open checkout failed:', error.message);
    throw new Error('Failed to open payment checkout');
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
