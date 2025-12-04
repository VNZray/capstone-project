/**
 * Booking Payment Service
 * Handles payment initiation for accommodation bookings via backend API
 * All PayMongo API calls are made through the backend for security
 */

import apiClient from '@/services/apiClient';
import * as WebBrowser from 'expo-web-browser';

export interface InitiateBookingPaymentRequest {
  payment_method_type: 'gcash' | 'paymaya' | 'grab_pay' | 'card' | 'dob' | 'qrph' | string;
  payment_type?: 'Full Payment' | 'Partial Payment';
  amount?: number; // Optional - defaults to booking balance or total
  bookingData?: any; // Optional - if provided, booking will be created during payment initiation
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
    booking_created?: boolean; // Indicates if booking was created in this request
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
 * Open PayMongo checkout URL in browser
 * Opens the hosted checkout page for the user to complete payment
 * @param checkoutUrl - PayMongo checkout URL
 * @returns Promise that resolves when browser is closed
 */
export async function openBookingCheckout(checkoutUrl: string): Promise<WebBrowser.WebBrowserResult> {
  try {
    const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      toolbarColor: '#0D1B2A',
      controlsColor: '#FFFFFF',
    });

    console.log('[BookingPaymentService] Browser result:', result);
    return result;
  } catch (error: any) {
    console.error('[BookingPaymentService] Open checkout failed:', error.message);
    throw new Error('Failed to open payment checkout');
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
