// Shared utilities for order controllers
import db from '../../db.js';

/**
 * Normalize order data for frontend (convert DECIMAL to number, ensure status casing)
 * @param {Object} order - Raw order object from database
 * @returns {Object} Normalized order object
 */
export function normalizeOrder(order) {
  return {
    ...order,
    status: order.status || 'pending',
    payment_status: order.payment_status || 'pending',
    payment_method: order.payment_method || 'cash_on_pickup',
    order_number: order.order_number || 'N/A',
    total_amount: typeof order.total_amount === 'number' ? order.total_amount : parseFloat(order.total_amount) || 0,
    subtotal: typeof order.subtotal === 'number' ? order.subtotal : parseFloat(order.subtotal) || 0,
    discount_amount: typeof order.discount_amount === 'number' ? order.discount_amount : parseFloat(order.discount_amount) || 0,
    tax_amount: typeof order.tax_amount === 'number' ? order.tax_amount : parseFloat(order.tax_amount) || 0,
  };
}

/**
 * Normalize order items (convert DECIMAL prices to numbers)
 * @param {Array} items - Raw order items from database
 * @returns {Array} Normalized items
 */
export function normalizeOrderItems(items) {
  return items.map((item) => ({
    ...item,
    unit_price: typeof item.unit_price === 'number' ? item.unit_price : parseFloat(item.unit_price) || 0,
    total_price: typeof item.total_price === 'number' ? item.total_price : parseFloat(item.total_price) || 0,
  }));
}

/**
 * Fetch complete order data for socket emission
 * Includes user email, items, and discount name
 * @param {string} orderId - Order UUID
 * @returns {Object} Complete order data ready for socket emission
 */
export async function getCompleteOrderForSocket(orderId) {
  // Fetch order details
  const [orderRows] = await db.query(
    "SELECT * FROM `order` WHERE id = ?",
    [orderId]
  );

  if (!orderRows || orderRows.length === 0) {
    throw new Error('Order not found');
  }

  const order = orderRows[0];

  // Fetch user email
  const [userEmailResult] = await db.query(
    "SELECT email FROM user WHERE id = ?",
    [order.user_id]
  );
  const userEmail = userEmailResult?.[0]?.email || 'unknown@email.com';

  // Fetch all order items
  const [itemsResult] = await db.query(
    "SELECT * FROM order_item WHERE order_id = ?",
    [orderId]
  );
  const itemsData = itemsResult || [];

  // Fetch discount name if exists
  let discountName = null;
  if (order.discount_id) {
    const [discountResult] = await db.query(
      "SELECT name FROM discount WHERE id = ?",
      [order.discount_id]
    );
    discountName = discountResult?.[0]?.name || null;
  }

  return {
    id: order.id,
    order_number: order.order_number,
    business_id: order.business_id,
    user_id: order.user_id,
    user_email: userEmail,
    status: order.status,
    payment_status: order.payment_status,
    payment_method: order.payment_method || 'cash_on_pickup',
    subtotal: order.subtotal,
    discount_amount: order.discount_amount || 0,
    tax_amount: order.tax_amount || 0,
    total_amount: order.total_amount,
    pickup_datetime: order.pickup_datetime,
    special_instructions: order.special_instructions,
    arrival_code: order.arrival_code,
    discount_name: discountName,
    item_count: itemsData.length,
    items: itemsData,
    ready_at: order.ready_at,
    picked_up_at: order.picked_up_at,
    updated_at: order.updated_at || new Date()
  };
}

/**
 * Generate a unique 8-character order number
 * Format: ORD-XXXXXX (e.g., ORD-A3B5C7)
 */
export function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ORD-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a unique 6-digit arrival code
 * Format: 123456
 */
export function generateArrivalCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
