
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
    throw new Error('PAYMONGO_SECRET_KEY not configured in environment');
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
    throw new Error('PAYMONGO_WEBHOOK_SECRET not configured in environment');
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
 * Create PayMongo Payment Intent for order
 * @param {Object} params
 * @param {string} params.orderId - Order UUID
 * @param {number} params.amount - Amount in centavos (PHP cents)
 * @param {string} params.description - Payment description
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Payment Intent data
 */
export async function createPaymentIntent({ orderId, amount, description, metadata = {} }) {
  // Validate amount (must be at least 100 centavos = 1 PHP)
  if (!amount || amount < 100) {
    throw new Error('Invalid amount: minimum 100 centavos (1 PHP)');
  }

  const data = await makePayMongoRequest('/payment_intents', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        attributes: {
          amount: Math.round(amount), // Ensure integer centavos
          payment_method_allowed: ['card', 'paymaya', 'gcash', 'grab_pay'],
          payment_method_options: {
            card: { request_three_d_secure: 'any' }
          },
          currency: 'PHP',
          description: description || `Order #${orderId}`,
          statement_descriptor: 'NAGA VENTURE',
          metadata: {
            order_id: orderId,
            ...metadata
          }
        }
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
export async function createSource({ type, amount, orderId, redirectUrl }) {
  const validTypes = ['gcash', 'grab_pay', 'paymaya'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid source type. Must be one of: ${validTypes.join(', ')}`);
  }

  if (!amount || amount < 100) {
    throw new Error('Invalid amount: minimum 100 centavos (1 PHP)');
  }

  const data = await makePayMongoRequest('/sources', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        attributes: {
          type,
          amount: Math.round(amount),
          currency: 'PHP',
          redirect: {
            success: redirectUrl || `${process.env.FRONTEND_URL}/orders/${orderId}/payment/success`,
            failed: redirectUrl || `${process.env.FRONTEND_URL}/orders/${orderId}/payment/failed`
          },
          metadata: {
            order_id: orderId
          }
        }
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
 * Create Refund for Payment
 * @param {Object} params
 * @param {string} params.paymentId - PayMongo payment ID
 * @param {number} params.amount - Amount to refund in centavos (optional, full refund if omitted)
 * @param {string} params.reason - Refund reason
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Refund data
 */
export async function createRefund({ paymentId, amount, reason, metadata = {} }) {
  if (!paymentId) {
    throw new Error('Payment ID is required for refund');
  }

  const body = {
    data: {
      attributes: {
        reason: reason || 'requested_by_customer',
        notes: metadata.notes || `Order cancellation: ${metadata.order_id || 'N/A'}`,
        metadata: {
          order_id: metadata.order_id,
          cancelled_by: metadata.cancelled_by
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
    
    // Extract timestamp and signatures from header
    // Format: t={timestamp},s1={signature1},s2={signature2},...
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
    const signatures = parts.filter(p => p.startsWith('s')).map(p => p.split('=')[1]);

    if (!timestamp || signatures.length === 0) {
      console.warn('[PayMongo Webhook] Invalid signature format');
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
    
    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    for (const sig of signatures) {
      try {
        const expectedBuffer = Buffer.from(expectedSignature);
        const actualBuffer = Buffer.from(sig);
        
        // Ensure buffers are same length before comparison
        if (expectedBuffer.length !== actualBuffer.length) {
          continue;
        }
        
        if (crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
          return true;
        }
      } catch (err) {
        // Invalid signature format, continue to next
        continue;
      }
    }

    console.warn('[PayMongo Webhook] Signature verification failed');
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
  createPaymentIntent,
  createSource,
  createPaymentMethod,
  attachPaymentIntent,
  getPaymentIntent,
  getSource,
  createRefund,
  verifyWebhookSignature,
  parseWebhookEvent
};
