
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
 * Create PayMongo Checkout Session for order (RECOMMENDED for most use cases)
 * This provides a hosted checkout page with all payment methods
 * @param {Object} params
 * @param {string} params.orderId - Order UUID
 * @param {string} params.orderNumber - Human-readable order number
 * @param {number} params.amount - Amount in centavos (PHP cents)
 * @param {Array<Object>} params.lineItems - Line items for the checkout
 * @param {string} params.successUrl - URL to redirect on success
 * @param {string} params.cancelUrl - URL to redirect on cancellation
 * @param {string} params.description - Payment description
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Checkout Session data with checkout_url
 */
export async function createCheckoutSession({ 
  orderId, 
  orderNumber, 
  amount, 
  lineItems = [], 
  successUrl, 
  cancelUrl, 
  description, 
  metadata = {} 
}) {
  // Validate amount (must be at least 100 centavos = 1 PHP)
  if (!amount || amount < 100) {
    throw new Error('Invalid amount: minimum 100 centavos (1 PHP)');
  }

  const sanitizedLineItems = (lineItems.length > 0 ? lineItems : [{
    currency: 'PHP',
    amount: Math.round(amount),
    name: description || `Order #${orderNumber}`,
    quantity: 1
  }]).map(item => {
    const cleanItem = { ...item };
    if (Array.isArray(cleanItem.images) && cleanItem.images.length === 0) {
      delete cleanItem.images;
    }
    return cleanItem;
  });

  const metadataPayload = {
    order_id: orderId,
    order_number: orderNumber,
    ...metadata
  };

  Object.keys(metadataPayload).forEach((key) => {
    if (metadataPayload[key] === undefined || metadataPayload[key] === null || metadataPayload[key] === '') {
      delete metadataPayload[key];
    }
  });

  const attributes = {
    line_items: sanitizedLineItems,
    payment_method_types: ['card', 'gcash', 'paymaya', 'grab_pay'],
    success_url: successUrl,
    cancel_url: cancelUrl,
    description: description || `Payment for Order #${orderNumber}`
  };

  if (Object.keys(metadataPayload).length > 0) {
    attributes.metadata = metadataPayload;
  }

  const data = await makePayMongoRequest('/checkout_sessions', {
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
 * Retrieve Checkout Session by ID
 * @param {string} checkoutSessionId 
 * @returns {Promise<Object>}
 */
export async function getCheckoutSession(checkoutSessionId) {
  const data = await makePayMongoRequest(`/checkout_sessions/${checkoutSessionId}`);
  return data.data;
}

/**
 * Create PayMongo Payment Intent for order (for advanced use cases)
 * Use createCheckoutSession for simpler integration
 * @param {Object} params
 * @param {string} params.orderId - Order UUID
 * @param {number} params.amount - Amount in centavos (PHP cents)
 * @param {string} params.description - Payment description
 * @param {Array<string>} params.paymentMethodAllowed - Allowed payment methods
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Payment Intent data
 */
export async function createPaymentIntent({ 
  orderId, 
  amount, 
  description, 
  paymentMethodAllowed = ['card', 'paymaya', 'gcash', 'grab_pay'],
  metadata = {},
  currency = 'PHP',
  statementDescriptor = 'NAGA VENTURE'
}) {
  // Validate amount (must be at least 100 centavos = 1 PHP)
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

  const attributes = {
    amount: Math.round(amount), // Ensure integer centavos
    payment_method_allowed: paymentMethodAllowed,
    payment_method_options: {
      card: { request_three_d_secure: 'any' }
    },
    currency,
    description: description || `Order #${orderId}`,
    statement_descriptor: statementDescriptor
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
 * @param {Object} params
 * @param {string} params.type - card, paymaya
 * @param {Object} params.details - Payment method details
 * @param {Object} params.billing - Billing information
 * @returns {Promise<Object>} Payment Method data
 */
export async function createPaymentMethod({ type, details, billing }) {
  const data = await makePayMongoRequest('/payment_methods', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        attributes: {
          type,
          details,
          billing
        }
      }
    })
  });

  return data.data;
}

/**
 * Attach Payment Method to Payment Intent
 * @param {string} paymentIntentId 
 * @param {string} paymentMethodId 
 * @param {string} returnUrl - URL to return after authentication
 * @returns {Promise<Object>}
 */
export async function attachPaymentIntent(paymentIntentId, paymentMethodId, returnUrl) {
  const data = await makePayMongoRequest(`/payment_intents/${paymentIntentId}/attach`, {
    method: 'POST',
    body: JSON.stringify({
      data: {
        attributes: {
          payment_method: paymentMethodId,
          return_url: returnUrl
        }
      }
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
  const data = await makePayMongoRequest(`/payments/${paymentId}`);
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

export default {
  createCheckoutSession,
  getCheckoutSession,
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
  parseWebhookEvent
};
