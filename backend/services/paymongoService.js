
/**
 * PayMongo Payment Service
 * Handles secure integration with PayMongo API
 *
 * Security practices:
 * - Secret keys never exposed to client
 * - Webhook signature verification using timing-safe comparison
 * - Request validation and sanitization
 * - Error handling without sensitive data leakage
 */

import crypto from 'crypto';

const PAYMONGO_API_URL = 'https://api.paymongo.com/v1';

/**
 * Get PayMongo secret key from environment
 * @returns {string}
 * @throws {Error} if key not configured
 */
function getSecretKey() {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) {
    const error = new Error('PAYMONGO_SECRET_KEY not configured in environment');
    error.code = 'PAYMONGO_NOT_CONFIGURED';
    throw error;
  }
  if (!key.startsWith('sk_')) {
    const error = new Error('Invalid PAYMONGO_SECRET_KEY format (should start with sk_test_ or sk_live_)');
    error.code = 'PAYMONGO_INVALID_KEY';
    throw error;
  }
  return key;
}

/**
 * Get PayMongo webhook secret from environment
 * @returns {string}
 * @throws {Error} if key not configured
 */
function getWebhookSecret() {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret) {
    const error = new Error('PAYMONGO_WEBHOOK_SECRET not configured in environment');
    error.code = 'PAYMONGO_NOT_CONFIGURED';
    throw error;
  }
  return secret;
}

/**
 * Make authenticated request to PayMongo API
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise<Object>}
 */
async function makePayMongoRequest(endpoint, options = {}) {
  const secretKey = getSecretKey();
  const encodedKey = Buffer.from(secretKey).toString('base64');

  const response = await fetch(`${PAYMONGO_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Basic ${encodedKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    // Don't expose internal error details to client
    console.error('[PayMongo API Error]', {
      status: response.status,
      endpoint,
      error: data
    });

    throw new Error(
      data.errors?.[0]?.detail ||
      `PayMongo API error: ${response.status}`
    );
  }

  return data;
}

/**
 * Create PayMongo Payment Intent for order (for advanced use cases)
 * Use createCheckoutSession for simpler integration
 *
 * Payment Intent Workflow:
 * 1. Create Payment Intent (server-side) - returns client_key
 * 2. Create Payment Method (client-side using public key)
 * 3. Attach Payment Method to Intent (client-side using client_key)
 * 4. Handle 3DS authentication if required (client follows next_action.redirect.url)
 * 5. Receive webhook: payment.paid or payment.failed
 *
 * @param {Object} params
 * @param {string} params.orderId - Order UUID
 * @param {number} params.amount - Amount in centavos (PHP cents), minimum 2000 (₱20.00)
 * @param {string} params.description - Payment description
 * @param {Array<string>} params.paymentMethodAllowed - Allowed payment methods
 * @param {Object} params.metadata - Additional metadata
 * @param {string} params.captureType - 'automatic' (default) or 'manual' for pre-auth
 * @returns {Promise<Object>} Payment Intent data with client_key
 */
export async function createPaymentIntent({
  orderId,
  amount,
  description,
  paymentMethodAllowed = ['card', 'paymaya', 'gcash', 'grab_pay'],
  metadata = {},
  currency = 'PHP',
  statementDescriptor = 'NAGA VENTURE',
  captureType = 'automatic'
}) {
  // Validate amount (minimum 2000 centavos = ₱20 for Payment Intents)
  if (!amount || amount < 2000) {
    throw new Error('Invalid amount: minimum 2000 centavos (₱20.00) for Payment Intents');
  }

  const metadataPayload = {
    order_id: orderId,
    ...metadata
  };

  // Clean up undefined/null/empty metadata values
  Object.keys(metadataPayload).forEach((key) => {
    if (metadataPayload[key] === undefined || metadataPayload[key] === null || metadataPayload[key] === '') {
      delete metadataPayload[key];
    }
  });

  const attributes = {
    amount: Math.round(amount), // Ensure integer centavos
    payment_method_allowed: paymentMethodAllowed,
    payment_method_options: {
      card: { request_three_d_secure: 'any' }
    },
    currency,
    description: description || `Order #${orderId}`,
    statement_descriptor: statementDescriptor,
    capture_type: captureType
  };

  if (Object.keys(metadataPayload).length > 0) {
    attributes.metadata = metadataPayload;
  }

  const data = await makePayMongoRequest('/payment_intents', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        attributes
      }
    })
  });

  return data.data;
}

/**
 * Create PayMongo Source (for non-card payments)
 * @param {Object} params
 * @param {string} params.type - gcash, grab_pay, paymaya
 * @param {number} params.amount - Amount in centavos
 * @param {string} params.orderId - Order UUID
 * @param {string} params.redirectUrl - Success/failed redirect URL
 * @returns {Promise<Object>} Source data with checkout_url
 */
export async function createSource({ type, amount, orderId, redirectUrl, redirect, metadata = {}, currency = 'PHP' }) {
  const validTypes = ['gcash', 'grab_pay', 'paymaya'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid source type. Must be one of: ${validTypes.join(', ')}`);
  }

  if (!amount || amount < 100) {
    throw new Error('Invalid amount: minimum 100 centavos (1 PHP)');
  }

  const metadataPayload = {
    order_id: orderId,
    ...metadata
  };

  Object.keys(metadataPayload).forEach((key) => {
    if (metadataPayload[key] === undefined || metadataPayload[key] === null || metadataPayload[key] === '') {
      delete metadataPayload[key];
    }
  });

  const baseUrl = process.env.FRONTEND_URL || process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

  const redirectConfig = redirect || {
    success: redirectUrl || `${baseUrl}/orders/${orderId}/payment/success`,
    failed: redirectUrl || `${baseUrl}/orders/${orderId}/payment/failed`
  };

  const attributes = {
    type,
    amount: Math.round(amount),
    currency,
    redirect: redirectConfig
  };

  if (Object.keys(metadataPayload).length > 0) {
    attributes.metadata = metadataPayload;
  }

  const data = await makePayMongoRequest('/sources', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        attributes
      }
    })
  });

  return data.data;
}

/**
 * Create PayMongo Payment Method
 *
 * For card payments: details should contain card_number, exp_month, exp_year, cvc
 * For e-wallets: type only needed (gcash, paymaya, grab_pay)
 * For DOB: bank_code required (bpi, ubp, or test_bank_one/test_bank_two for testing)
 *
 * IMPORTANT: Card details should be collected client-side for PCI compliance.
 * This function is for server-side use with e-wallets/DOB or tokenized cards.
 *
 * @param {Object} params
 * @param {string} params.type - card, paymaya, gcash, grab_pay, dob, billease, qrph, brankas, shopee_pay
 * @param {Object} params.details - Payment method details (card details or bank_code)
 * @param {Object} params.billing - Billing information (name, email, phone, address)
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Payment Method data
 */
export async function createPaymentMethod({ type, details = {}, billing = {}, metadata = {} }) {
  const validTypes = ['card', 'paymaya', 'gcash', 'grab_pay', 'dob', 'billease', 'qrph', 'brankas', 'shopee_pay'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid payment method type. Must be one of: ${validTypes.join(', ')}`);
  }

  const attributes = { type };

  // Add details for card or DOB
  if (type === 'card' && details.card_number) {
    attributes.details = {
      card_number: details.card_number,
      exp_month: details.exp_month,
      exp_year: details.exp_year,
      cvc: details.cvc
    };
  } else if ((type === 'dob' || type === 'brankas') && details.bank_code) {
    attributes.details = { bank_code: details.bank_code };
  }

  // Add billing info if provided
  if (Object.keys(billing).length > 0) {
    attributes.billing = {
      name: billing.name,
      email: billing.email,
      phone: billing.phone,
      address: billing.address || {}
    };
  }

  // Add metadata if provided
  if (Object.keys(metadata).length > 0) {
    attributes.metadata = metadata;
  }

  const data = await makePayMongoRequest('/payment_methods', {
    method: 'POST',
    body: JSON.stringify({
      data: { attributes }
    })
  });

  return data.data;
}

/**
 * Attach Payment Method to Payment Intent
 *
 * For e-wallets and redirect-based methods, return_url is required.
 * After attachment, check the next_action field:
 * - If next_action.type === 'redirect', redirect user to next_action.redirect.url
 * - After user completes auth, they return to return_url
 *
 * @param {string} paymentIntentId - Payment Intent ID
 * @param {string} paymentMethodId - Payment Method ID
 * @param {string} returnUrl - URL to return after authentication (required for e-wallets)
 * @param {string} clientKey - Client key (required when using public API key)
 * @returns {Promise<Object>} Updated Payment Intent with next_action
 */
export async function attachPaymentIntent(paymentIntentId, paymentMethodId, returnUrl, clientKey = null) {
  const attributes = {
    payment_method: paymentMethodId,
    return_url: returnUrl
  };

  // Include client_key if provided (for client-side API calls)
  if (clientKey) {
    attributes.client_key = clientKey;
  }

  const data = await makePayMongoRequest(`/payment_intents/${paymentIntentId}/attach`, {
    method: 'POST',
    body: JSON.stringify({
      data: { attributes }
    })
  });

  return data.data;
}

/**
 * Retrieve Payment Intent by ID
 * @param {string} paymentIntentId
 * @returns {Promise<Object>}
 */
export async function getPaymentIntent(paymentIntentId) {
  const data = await makePayMongoRequest(`/payment_intents/${paymentIntentId}`);
  return data.data;
}

/**
 * Retrieve Source by ID
 * @param {string} sourceId
 * @returns {Promise<Object>}
 */
export async function getSource(sourceId) {
  const data = await makePayMongoRequest(`/sources/${sourceId}`);
  return data.data;
}

/**
 * Retrieve Payment by ID
 * @param {string} paymentId
 * @returns {Promise<Object>}
 */
export async function getPayment(paymentId) {
  const data = await makePayMongoRequest(`/payment/${paymentId}`);
  return data.data;
}

/**
 * Create Refund for Payment
 * @param {Object} params
 * @param {string} params.paymentId - PayMongo payment ID (NOT payment intent ID)
 * @param {number} params.amount - Amount to refund in centavos (optional, full refund if omitted)
 * @param {string} params.reason - Refund reason (duplicate, fraudulent, requested_by_customer, others)
 * @param {string} params.notes - Additional notes
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Refund data
 */
export async function createRefund({ paymentId, amount, reason, notes, metadata = {} }) {
  if (!paymentId) {
    throw new Error('Payment ID is required for refund');
  }

  const validReasons = ['duplicate', 'fraudulent', 'requested_by_customer', 'others'];
  const refundReason = validReasons.includes(reason) ? reason : 'requested_by_customer';

  const body = {
    data: {
      attributes: {
        payment_id: paymentId,
        reason: refundReason,
        notes: notes || `Order cancellation: ${metadata.order_id || 'N/A'}`,
        metadata: {
          order_id: metadata.order_id,
          cancelled_by: metadata.cancelled_by,
          ...metadata
        }
      }
    }
  };

  // Include amount only if partial refund
  if (amount) {
    body.data.attributes.amount = Math.round(amount);
  }

  const data = await makePayMongoRequest(`/refunds`, {
    method: 'POST',
    body: JSON.stringify(body)
  });

  return data.data;
}

/**
 * Retrieve Refund by ID
 * @param {string} refundId
 * @returns {Promise<Object>}
 */
export async function getRefund(refundId) {
  const data = await makePayMongoRequest(`/refunds/${refundId}`);
  return data.data;
}

/**
 * Verify PayMongo webhook signature using timing-safe comparison
 * CRITICAL SECURITY: Use crypto.timingSafeEqual to prevent timing attacks
 *
 * @param {string} payload - Raw request body as string
 * @param {string} signature - Signature from request headers
 * @returns {boolean} True if signature is valid
 */
export function verifyWebhookSignature(payload, signature) {
  if (!payload || !signature) {
    console.warn('[PayMongo Webhook] Missing payload or signature');
    return false;
  }

  try {
    const webhookSecret = getWebhookSecret();

    console.log('[PayMongo Webhook] 🔍 Verifying signature...');
    console.log('[PayMongo Webhook] 📋 Signature header:', signature);
    console.log('[PayMongo Webhook] 🔑 Webhook secret configured:', webhookSecret ? 'YES' : 'NO');

    // Extract timestamp and signatures from header
    // PayMongo format: t={timestamp},te={signature},li=
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];

    // PayMongo uses 'te=' for the test signature (not 's1=')
    const signaturePart = parts.find(p => p.startsWith('te='))?.split('=')[1];
    const signatures = signaturePart ? [signaturePart] : [];

    console.log('[PayMongo Webhook] 📅 Extracted timestamp:', timestamp);
    console.log('[PayMongo Webhook] 📝 Extracted signatures:', signatures);

    if (!timestamp || signatures.length === 0) {
      console.warn('[PayMongo Webhook] Invalid signature format - missing timestamp or signature parts');
      return false;
    }

    // Verify timestamp is within tolerance (5 minutes)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timestampDiff = Math.abs(currentTimestamp - parseInt(timestamp));
    if (timestampDiff > 300) { // 5 minutes
      console.warn('[PayMongo Webhook] Signature timestamp too old or too new');
      return false;
    }

    // Construct signed payload
    const signedPayload = `${timestamp}.${payload}`;

    console.log('[PayMongo Webhook] 🔨 Signed payload:', signedPayload.substring(0, 100) + '...');

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    console.log('[PayMongo Webhook] 🎯 Expected signature:', expectedSignature);
    console.log('[PayMongo Webhook] 📨 Received signatures:', signatures);

    // Use timing-safe comparison to prevent timing attacks
    for (const sig of signatures) {
      try {
        const expectedBuffer = Buffer.from(expectedSignature);
        const actualBuffer = Buffer.from(sig);

        console.log('[PayMongo Webhook] 🔍 Comparing signature:', sig.substring(0, 20) + '...');

        // Ensure buffers are same length before comparison
        if (expectedBuffer.length !== actualBuffer.length) {
          console.log('[PayMongo Webhook] ⚠️ Length mismatch:', expectedBuffer.length, 'vs', actualBuffer.length);
          continue;
        }

        if (crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
          console.log('[PayMongo Webhook] ✅ Signature verification PASSED');
          return true;
        }
      } catch (err) {
        // Invalid signature format, continue to next
        console.log('[PayMongo Webhook] ❌ Comparison error:', err.message);
        continue;
      }
    }

    console.warn('[PayMongo Webhook] ❌ Signature verification FAILED - no matching signature');
    return false;
  } catch (error) {
    console.error('[PayMongo Webhook] Signature verification error:', error.message);
    return false;
  }
}

/**
 * Parse and validate webhook event
 * @param {Object} event - Webhook event data
 * @returns {Object} Parsed event with type and data
 */
export function parseWebhookEvent(event) {
  if (!event?.data) {
    throw new Error('Invalid webhook event structure');
  }

  const eventType = event.data.attributes?.type;
  const eventData = event.data.attributes?.data;

  if (!eventType) {
    throw new Error('Webhook event missing type');
  }

  return {
    id: event.data.id,
    type: eventType,
    livemode: event.data.attributes?.livemode || false,
    created_at: event.data.attributes?.created_at,
    data: eventData,
    previous_data: event.data.attributes?.previous_data
  };
}

/**
 * PIPM Flow: Create Payment Intent, Payment Method, and Attach in one call
 * This is the recommended flow for booking payments (replaces Checkout Sessions)
 * 
 * Flow:
 * 1. Create Payment Intent with amount and allowed methods
 * 2. Create Payment Method with the selected type
 * 3. Attach Payment Method to Intent - returns redirect URL for e-wallets
 * 
 * @param {Object} params
 * @param {string} params.referenceId - Booking/Order UUID for tracking
 * @param {number} params.amount - Amount in centavos (minimum 2000 = ₱20)
 * @param {string} params.paymentMethodType - gcash, paymaya, grab_pay, card, etc.
 * @param {string} params.description - Payment description
 * @param {string} params.returnUrl - URL to redirect after payment authentication
 * @param {Object} params.billing - Billing info (name, email, phone)
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} { paymentIntent, paymentMethod, redirectUrl, clientKey }
 */
export async function createPIPMPayment({
  referenceId,
  amount,
  paymentMethodType,
  description,
  returnUrl,
  billing = {},
  metadata = {}
}) {
  // Validate amount (minimum 2000 centavos = ₱20 for Payment Intents)
  if (!amount || amount < 2000) {
    throw new Error('Invalid amount: minimum 2000 centavos (₱20.00) for Payment Intents');
  }

  // Validate payment method type
  const validTypes = ['card', 'paymaya', 'gcash', 'grab_pay', 'dob', 'billease', 'qrph', 'brankas', 'shopee_pay'];
  if (!validTypes.includes(paymentMethodType)) {
    throw new Error(`Invalid payment method type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Clean metadata
  const metadataPayload = {
    reference_id: referenceId,
    ...metadata
  };
  Object.keys(metadataPayload).forEach((key) => {
    if (metadataPayload[key] === undefined || metadataPayload[key] === null || metadataPayload[key] === '') {
      delete metadataPayload[key];
    }
  });

  console.log(`[PIPM] Creating payment for ${referenceId}: ₱${(amount/100).toFixed(2)} via ${paymentMethodType}`);

  // Step 1: Create Payment Intent
  const paymentIntent = await createPaymentIntent({
    orderId: referenceId,
    amount,
    description,
    paymentMethodAllowed: [paymentMethodType],
    metadata: metadataPayload,
    currency: 'PHP',
    statementDescriptor: 'CITY VENTURE'
  });

  console.log(`[PIPM] Payment Intent created: ${paymentIntent.id}`);

  // Step 2: Create Payment Method
  const paymentMethod = await createPaymentMethod({
    type: paymentMethodType,
    billing,
    metadata: { reference_id: referenceId }
  });

  console.log(`[PIPM] Payment Method created: ${paymentMethod.id}`);

  // Step 3: Attach Payment Method to Payment Intent
  const attachedIntent = await attachPaymentIntent(
    paymentIntent.id,
    paymentMethod.id,
    returnUrl
  );

  console.log(`[PIPM] Payment Method attached. Status: ${attachedIntent.attributes.status}`);

  // Extract redirect URL for e-wallet authentication
  let redirectUrl = null;
  const nextAction = attachedIntent.attributes.next_action;
  
  if (nextAction && nextAction.type === 'redirect') {
    redirectUrl = nextAction.redirect.url;
    console.log(`[PIPM] Redirect URL: ${redirectUrl}`);
  }

  return {
    paymentIntent: attachedIntent,
    paymentIntentId: attachedIntent.id,
    paymentMethodId: paymentMethod.id,
    clientKey: paymentIntent.attributes.client_key,
    status: attachedIntent.attributes.status,
    redirectUrl,
    // For compatibility - some code may expect checkout_url
    checkout_url: redirectUrl
  };
}

export default {
  createPaymentIntent,
  createSource,
  createPaymentMethod,
  attachPaymentIntent,
  getPaymentIntent,
  getSource,
  getPayment,
  createRefund,
  getRefund,
  verifyWebhookSignature,
  parseWebhookEvent,
  createPIPMPayment
};
