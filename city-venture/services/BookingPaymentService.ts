/**
 * Booking Payment Service
 * Handles payment initiation for accommodation bookings via backend API
 * All PayMongo API calls are made through the backend for security
 * 
 * SECURITY NOTE: Uses openAuthSessionAsync for external browser authentication
 * which is more secure than WebView as it:
 * - Prevents session hijacking
 * - Uses the system browser's security features
 * - Properly handles deep link redirects
 */

import apiClient from '@/services/apiClient';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

export interface InitiateBookingPaymentRequest {
  payment_method_type: 'gcash' | 'paymaya' | 'grab_pay' | 'card' | 'dob' | 'qrph' | string;
  payment_type?: 'Full Payment' | 'Partial Payment';
  amount?: number; // Optional - defaults to booking balance or total
}

export interface InitiateBookingPaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: string;
    booking_id: string;
    amount: number;
    currency: string;
    payment_method_type: string;
    payment_type: string;
    payment_intent_id: string;
    checkout_url: string;
    status: string;
  };
}

/**
 * Initiate payment for a booking
 * This creates a PayMongo checkout session via the backend
 * @param bookingId - The booking UUID
 * @param paymentData - Payment details including method type and amount
 * @returns Payment response with checkout URL
 */
export async function initiateBookingPayment(
  bookingId: string,
  paymentData: InitiateBookingPaymentRequest
): Promise<InitiateBookingPaymentResponse> {
  try {
    const response = await apiClient.post<InitiateBookingPaymentResponse>(
      `/booking/${bookingId}/initiate-payment`,
      paymentData
    );

    return response.data;
  } catch (error: any) {
    console.error('[BookingPaymentService] Initiate payment failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Open PayMongo checkout URL in secure external browser session
 * Uses openAuthSessionAsync which:
 * - Opens in the system browser (more secure than WebView)
 * - Auto-closes when redirect URL is detected
 * - Returns control back to the app with the final URL
 * 
 * @param checkoutUrl - PayMongo checkout URL
 * @param expectedRedirectBase - Base URL that PayMongo will redirect to after payment (your backend bridge)
 * @returns Promise with browser auth session result
 */
export async function openBookingCheckout(
  checkoutUrl: string,
  expectedRedirectBase?: string
): Promise<WebBrowser.WebBrowserAuthSessionResult> {
  try {
    // The redirect URL is typically your backend's bridge endpoint
    // openAuthSessionAsync will detect when the browser navigates to this URL
    // and automatically close, returning the full URL with query params
    const redirectListenUrl = expectedRedirectBase || Linking.createURL('');
    
    console.log('[BookingPaymentService] Opening auth session:', checkoutUrl);
    console.log('[BookingPaymentService] Listening for redirect to:', redirectListenUrl);

    const result = await WebBrowser.openAuthSessionAsync(
      checkoutUrl,
      redirectListenUrl,
      {
        preferEphemeralSession: true, // Don't persist cookies across sessions for security
      }
    );

    console.log('[BookingPaymentService] Auth session result:', result);
    return result;
  } catch (error: any) {
    console.error('[BookingPaymentService] Open checkout failed:', error.message);
    throw new Error('Failed to open payment checkout');
  }
}

/**
 * Dismiss any active browser session
 * Call this when handling deep links from payment completion
 */
export function dismissBookingBrowser(): void {
  try {
    WebBrowser.dismissBrowser();
  } catch {
    // Browser might not be open, ignore
  }
}

/**
 * Helper to map payment method name to PayMongo type
 * @param methodName - Display name of payment method (e.g., 'GCash', 'PayMaya')
 * @returns PayMongo payment method type
 */
export function mapPaymentMethodType(methodName: string): string {
  const method = (methodName || '').toLowerCase();
  
  const methodMap: Record<string, string> = {
    'gcash': 'gcash',
    'paymaya': 'paymaya',
    'maya': 'paymaya',
    'grab_pay': 'grab_pay',
    'grabpay': 'grab_pay',
    'grab pay': 'grab_pay',
    'card': 'card',
    'credit card': 'card',
    'debit card': 'card',
    'dob': 'dob',
    'qrph': 'qrph',
  };

  // Find matching method
  for (const [key, value] of Object.entries(methodMap)) {
    if (method.includes(key)) {
      return value;
    }
  }

  // Default to gcash if no match
  return 'gcash';
}

export interface VerifyBookingPaymentResponse {
  success: boolean;
  data: {
    verified: boolean;
    payment_status: 'success' | 'failed' | 'pending' | 'processing' | 'unknown';
    message: string;
    payment_intent_status: string;
    booking_id: string;
    payment_id: string;
    amount: number;
    last_payment_error?: {
      message?: string;
      code?: string;
    };
  };
}

/**
 * Verify payment status after PayMongo redirect
 * This checks the actual PayMongo Payment Intent status to confirm
 * whether the payment was successful or failed.
 * 
 * @param bookingId - The booking UUID
 * @param paymentId - The local payment record UUID
 * @returns Verification result with actual payment status
 */
export async function verifyBookingPayment(
  bookingId: string,
  paymentId: string
): Promise<VerifyBookingPaymentResponse> {
  try {
    const response = await apiClient.get<VerifyBookingPaymentResponse>(
      `/booking/${bookingId}/verify-payment/${paymentId}`
    );

    return response.data;
  } catch (error: any) {
    console.error('[BookingPaymentService] Verify payment failed:', error.response?.data || error.message);
    throw error;
  }
}
