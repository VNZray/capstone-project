/**
 * PayMongo Error Handling Utilities
 *
 * Centralized error code mapping for PayMongo payment errors.
 * Maps sub_codes to user-friendly messages following PayMongo's recommended practices.
 *
 * @see https://developers.paymongo.com/docs/common-card-errors
 */

// Generic message for security-sensitive errors (fraud, lost/stolen cards)
// PayMongo recommends NOT exposing these details to customers
export const GENERIC_DECLINE_MESSAGE =
  'Your card was declined. Please contact your bank or try a different card.';

/**
 * Declined transaction sub_codes
 * These are declines from the card issuer for various reasons
 */
export const DECLINED_MESSAGES: Record<string, string> = {
  generic_decline:
    'Your card was declined. Please contact your bank or try a different card.',
  do_not_honor:
    'Your card was declined. Please contact your bank or try a different card.',
  payment_refused:
    'Payment was refused. Please try a different card or payment method.',
  insufficient_funds:
    'Insufficient funds. Please try a different card or payment method.',
  debit_card_usage_limit_exceeded:
    'Card usage limit exceeded. Please try a different card or payment method.',
  issuer_declined:
    'Your bank declined this transaction. Please contact them for more information.',
  issuer_not_available:
    "We couldn't reach your bank. Please wait a few minutes and try again.",
  amount_allowed_exceeded:
    'Amount exceeds your card limit. Please contact your bank or try a different card.',
  call_card_issuer:
    'Please contact your bank for more information, then try again.',
  card_not_supported:
    'This card type is not supported. Please try a different card.',
  card_type_mismatch:
    'Card type mismatch. Please verify your card details and try again.',
  card_unauthorized:
    'This card is not authorized for online payments. Please contact your bank or try a different card.',
  credit_limit_exceeded:
    'Credit limit exceeded. Please try a different card or payment method.',
  currency_not_supported_by_card_issuer:
    'Your card does not support this currency. Please try a different card.',
};

/**
 * Blocked transaction sub_codes
 * Security-sensitive - always show generic message per PayMongo recommendation
 */
export const BLOCKED_CODES = [
  'fraudulent',
  'highest_risk_level',
  'lost_card',
  'pickup_card',
  'processor_blocked',
  'restricted_card',
  'stolen_card',
  'blocked',
];

/**
 * Processor error sub_codes
 * Issues with payment processing infrastructure
 */
export const PROCESSOR_MESSAGES: Record<string, string> = {
  avs_failed:
    'Address verification failed. Please check your billing address and try again.',
  card_not_accepted:
    'This card type is not accepted. Please try a different card.',
  config_invalid_or_missing:
    'Payment processing error. Please try again or contact support.',
  customer_blacklisted:
    'This payment cannot be processed. Please contact support.',
  merchant_configuration_invalid:
    'Payment processing error. Please try again or contact support.',
  processing_error:
    'Payment processing error. Please wait a few minutes and try again.',
  processor_declined:
    'Payment was declined. Please try a different card or payment method.',
  processor_timeout:
    'Payment timed out. Please try again or contact support.',
  processor_unavailable:
    'Payment processor unavailable. Please wait a few minutes and try again, or use a different card.',
  system_error: 'System error. Please try again later or contact support.',
};

/**
 * Unknown error sub_codes
 * Catch-all for unidentified issues
 */
export const UNKNOWN_ERROR_CODES = [
  'server_timeout',
  'service_timeout',
  'unknown_error',
];

/**
 * Invalid card details sub_codes
 * Issues with the card information provided
 */
export const INVALID_CARD_MESSAGES: Record<string, string> = {
  card_number_invalid:
    'Invalid card number. Please verify your card details and try again.',
  cvc_invalid: 'Invalid security code (CVC). Please check and try again.',
  cvc_incorrect: 'Incorrect security code (CVC). Please check and try again.',
  card_expired: 'Your card has expired. Please use a different card.',
  expired_card: 'Your card has expired. Please use a different card.', // Alternative code
  card_type_mismatch:
    'Card type mismatch. Please verify your card details and try again.',
};

/**
 * Parse PayMongo error and return user-friendly message
 *
 * @param error - Error object from PayMongo API call
 * @returns Object with title, message, and whether it's a card error
 */
export function parsePayMongoError(error: any): {
  title: string;
  message: string;
  isCardError: boolean;
  subCode?: string;
  errorCode?: string;
} {
  // Extract sub_code from multiple possible locations in the error structure:
  // 1. error.response.data.errors[0].sub_code - From axios error response
  // 2. error.sub_code - Directly attached by PaymentIntentService
  // 3. error.response.data.last_payment_error.sub_code - From Payment Intent status
  // 4. error.last_payment_error.sub_code - Direct last_payment_error
  const subCode =
    error.response?.data?.errors?.[0]?.sub_code ||
    error.sub_code ||
    error.response?.data?.last_payment_error?.sub_code ||
    error.last_payment_error?.sub_code;

  // Extract error code similarly
  const errorCode =
    error.response?.data?.errors?.[0]?.code ||
    error.code ||
    error.response?.data?.last_payment_error?.code ||
    error.last_payment_error?.code;

  // Log for debugging
  if (subCode || errorCode) {
    console.log('[PayMongoErrors] Parsed error codes:', {
      subCode,
      errorCode,
      message: error.message,
    });
  }

  // Check if it's a card-related error
  if (errorCode === 'resource_failed_state' || subCode) {
    // Check blocked transactions first (use generic message for security)
    if (BLOCKED_CODES.includes(subCode)) {
      return {
        title: 'Card Declined',
        message: GENERIC_DECLINE_MESSAGE,
        isCardError: true,
        subCode,
        errorCode,
      };
    }

    // Check unknown errors
    if (UNKNOWN_ERROR_CODES.includes(subCode)) {
      return {
        title: 'Payment Error',
        message:
          'Payment failed due to an unknown error. Please try again or contact support.',
        isCardError: true,
        subCode,
        errorCode,
      };
    }

    // Check invalid card details
    if (INVALID_CARD_MESSAGES[subCode]) {
      return {
        title: 'Invalid Card Details',
        message: INVALID_CARD_MESSAGES[subCode],
        isCardError: true,
        subCode,
        errorCode,
      };
    }

    // Check processor errors
    if (PROCESSOR_MESSAGES[subCode]) {
      return {
        title: 'Payment Error',
        message: PROCESSOR_MESSAGES[subCode],
        isCardError: true,
        subCode,
        errorCode,
      };
    }

    // Check declined transactions
    if (DECLINED_MESSAGES[subCode]) {
      return {
        title: 'Card Declined',
        message: DECLINED_MESSAGES[subCode],
        isCardError: true,
        subCode,
        errorCode,
      };
    }

    // Default to generic decline for any unmapped sub_code
    return {
      title: 'Card Declined',
      message: GENERIC_DECLINE_MESSAGE,
      isCardError: true,
      subCode,
      errorCode,
    };
  }

  // Generic payment errors
  if (
    error.message?.includes('declined') ||
    error.message?.includes('card')
  ) {
    return {
      title: 'Payment Failed',
      message:
        error.message ||
        'Your payment could not be processed. Please try again or use a different payment method.',
      isCardError: true,
      subCode,
      errorCode,
    };
  }

  // Order creation errors (from backend)
  if (error.response?.data?.message) {
    return {
      title: 'Order Failed',
      message: error.response.data.message,
      isCardError: false,
      subCode,
      errorCode,
    };
  }

  // Generic error
  return {
    title: 'Something Went Wrong',
    message:
      error.message || 'Failed to process your order. Please try again.',
    isCardError: false,
    subCode,
    errorCode,
  };
}

/**
 * Get suggested action for a specific sub_code
 *
 * @param subCode - PayMongo error sub_code
 * @returns Suggested action string
 */
export function getSuggestedAction(subCode: string): string {
  // Blocked codes - generic action
  if (BLOCKED_CODES.includes(subCode)) {
    return 'Please try a different card or payment method.';
  }

  // Invalid card - fix the issue
  if (INVALID_CARD_MESSAGES[subCode]) {
    if (subCode === 'card_expired' || subCode === 'expired_card') {
      return 'Please use a card that has not expired.';
    }
    if (subCode === 'cvc_invalid' || subCode === 'cvc_incorrect') {
      return 'Check the security code on the back of your card and try again.';
    }
    return 'Please verify your card details and try again.';
  }

  // Processor errors - wait and retry
  if (PROCESSOR_MESSAGES[subCode]) {
    if (subCode === 'processor_unavailable' || subCode === 'processing_error') {
      return 'Wait a few minutes before trying again.';
    }
    return 'Please try a different card or contact support.';
  }

  // Declined - contact bank or use different card
  if (DECLINED_MESSAGES[subCode]) {
    if (subCode === 'insufficient_funds') {
      return 'Use a different card or add funds to your account.';
    }
    if (
      subCode === 'issuer_declined' ||
      subCode === 'call_card_issuer'
    ) {
      return 'Contact your bank for more details.';
    }
    return 'Please try a different card or payment method.';
  }

  // Default action
  return 'Please try a different card or payment method.';
}

export default {
  GENERIC_DECLINE_MESSAGE,
  DECLINED_MESSAGES,
  BLOCKED_CODES,
  PROCESSOR_MESSAGES,
  UNKNOWN_ERROR_CODES,
  INVALID_CARD_MESSAGES,
  parsePayMongoError,
  getSuggestedAction,
};
