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
    provider_reference: string;
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
