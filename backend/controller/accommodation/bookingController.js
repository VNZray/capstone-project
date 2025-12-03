import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";
import { incrementPromotionUsage } from "../promotionController.js";
import * as paymongoService from "../../services/paymongoService.js";

// Environment configuration for payment redirects
const FRONTEND_BASE_URL = (process.env.FRONTEND_BASE_URL || "http://localhost:5173").replace(/\/$/, "");
const PAYMONGO_REDIRECT_BASE = (process.env.PAYMONGO_REDIRECT_BASE || FRONTEND_BASE_URL).trim();

// Booking fields in the order expected by the stored procedures after id
const BOOKING_FIELDS = [
  "pax",
  "num_children",
  "num_adults",
  "num_infants",
  "foreign_counts",
  "domestic_counts",
  "overseas_counts",
  "local_counts",
  "trip_purpose",
  "booking_type",
  "check_in_date",
  "check_out_date",
  "check_in_time",
  "check_out_time",
  "total_price",
  "balance",
  "booking_status",
  "room_id",
  "tourist_id",
  "business_id",
];

const makePlaceholders = (n) => Array(n).fill("?").join(", ");

const buildBookingParams = (id, body, options = {}) => {
  // map fields in BOOKING_FIELDS order. For insert, allow defaults via options
  return [
    id,
    ...BOOKING_FIELDS.map((f) => {
      if (Object.prototype.hasOwnProperty.call(body, f)) return body[f];
      // insert defaults
      if (options.defaultBalanceFor === f) return options.defaultBalanceValue;
      if (options.defaultStatusFor === f) return options.defaultStatusValue;
      return null;
    }),
  ];
};
// Get all bookings
export async function getAllBookings(req, res) {
  try {
    const [rows] = await db.query("CALL GetAllBookings()");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBookingsByRoomId(req, res) {
  try {
    const { room_id } = req.params;
    const [rows] = await db.query("CALL GetBookingsByRoomId(?)", [room_id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get booking by ID
export async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query("CALL GetBookingById(?)", [id]);
    res.json(rows[0][0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get bookings by tourist ID
export async function getBookingsByTouristId(req, res) {
  try {
    const { tourist_id } = req.params;
    const [rows] = await db.query("CALL GetBookingsByTouristId(?)", [
      tourist_id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get bookings by business ID
export async function getBookingsByBusinessId(req, res) {
  try {
    const { business_id } = req.params;
    const [rows] = await db.query("CALL GetBookingsByBusinessId(?)", [
      business_id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Insert booking
export async function insertBooking(req, res) {
  try {
    const {
      id = uuidv4(),
      pax,
      num_children = 0,
      num_adults = 0,
      num_infants = 0,
      foreign_counts = 0,
      domestic_counts = 0,
      overseas_counts = 0,
      local_counts = 0,
      trip_purpose,
      booking_type = "overnight",
      check_in_date,
      check_out_date,
      check_in_time = "14:00:00", // Default check-in time: 2:00 PM
      check_out_time = "12:00:00", // Default check-out time: 12:00 PM
      total_price,
      balance,
      booking_status,
      room_id,
      tourist_id,
      business_id,
    } = req.body;

    const missing = [];
    if (pax === undefined) missing.push("pax");
    if (!trip_purpose) missing.push("trip_purpose");
    if (!check_in_date) missing.push("check_in_date");
    if (!check_out_date) missing.push("check_out_date");
    if (!room_id) missing.push("room_id");
    if (!tourist_id) missing.push("tourist_id");
    if (total_price === undefined) missing.push("total_price");
    if (missing.length) {
      return res
        .status(400)
        .json({ error: "Missing required fields", fields: missing });
    }

    // Validation: For short-stay bookings, times are critical
    if (booking_type === "short-stay") {
      if (!req.body.check_in_time) {
        return res.status(400).json({
          error: "check_in_time is required for short-stay bookings"
        });
      }
      if (!req.body.check_out_time) {
        return res.status(400).json({
          error: "check_out_time is required for short-stay bookings"
        });
      }
    }

    const effectiveBalance = balance ?? total_price;
    const effectiveStatus = booking_status ?? "Pending";

    // Prepare body with defaults applied
    const bodyWithDefaults = {
      ...req.body,
      check_in_time: req.body.check_in_time || check_in_time,
      check_out_time: req.body.check_out_time || check_out_time,
    };

    // build params with defaults applied for balance and booking_status
    const params = buildBookingParams(id, bodyWithDefaults, {
      defaultBalanceFor: "balance",
      defaultBalanceValue: effectiveBalance,
      defaultStatusFor: "booking_status",
      defaultStatusValue: effectiveStatus,
    });
    const placeholders = makePlaceholders(params.length);
    const [rows] = await db.query(`CALL InsertBooking(${placeholders})`, params);

    // Increment usage count for applied promotions
    if (req.body.applied_promotions && Array.isArray(req.body.applied_promotions)) {
      for (const promoId of req.body.applied_promotions) {
        if (promoId) {
          await incrementPromotionUsage(promoId);
        }
      }
    }

    return res.status(201).json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update booking
export async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id parameter is required" });

    const [rows] = await db.query(
      // build params for update, coalescing undefined to null
      (() => {
        const body = req.body || {};
        const params = [
          id,
          ...BOOKING_FIELDS.map((f) => (Object.prototype.hasOwnProperty.call(body, f) ? body[f] : null)),
        ];
        const placeholders = makePlaceholders(params.length);
        return db.query(`CALL UpdateBooking(${placeholders})`, params);
      })()
    );
    return res.json(rows[0][0]);
  } catch (err) {
    return handleDbError
      ? handleDbError(res, err)
      : res.status(500).json({ error: err.message });
  }
}

// Delete booking
export async function deleteBooking(req, res) {
  try {
    const { id } = req.params;
    await db.query("CALL DeleteBooking(?)", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ================== PayMongo Integration for Bookings ==================

/**
 * Initiate payment for a booking using PayMongo Checkout Session
 * POST /api/bookings/:id/initiate-payment
 * Body: { 
 *   payment_method_type: 'gcash' | 'paymaya' | 'grab_pay' | 'card' | etc.,
 *   payment_type?: 'Full Payment' | 'Partial Payment',
 *   amount?: number (optional - defaults to booking total_price or balance)
 * }
 * Auth: Required (Tourist role)
 */
export async function initiateBookingPayment(req, res) {
  try {
    const { id: booking_id } = req.params;
    const { payment_method_type = 'gcash', payment_type = 'Full Payment', amount } = req.body;
    const user_id = req.user?.id;

    // Validate user authentication
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // 1. Fetch booking details
    const [bookingRows] = await db.query(
      `SELECT 
        b.id, b.total_price, b.balance, b.booking_status, b.tourist_id, b.business_id, b.room_id,
        b.check_in_date, b.check_out_date, b.pax,
        CONCAT(r.room_type, ' - ', r.room_number) as room_name, r.room_price as price_per_night,
        bus.business_name,
        t.id as tourist_user_id
       FROM booking b
       LEFT JOIN room r ON b.room_id = r.id
       LEFT JOIN business bus ON b.business_id = bus.id
       LEFT JOIN tourist t ON b.tourist_id = t.id
       WHERE b.id = ?`,
      [booking_id]
    );

    if (!bookingRows || bookingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const booking = bookingRows[0];

    // 2. Validate ownership - tourist_id should match the authenticated user's tourist record
    // First, get the tourist record for this user
    const [touristRows] = await db.query(
      `SELECT id FROM tourist WHERE user_id = ?`,
      [user_id]
    );

    if (!touristRows || touristRows.length === 0 || touristRows[0].id !== booking.tourist_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to initiate payment for this booking"
      });
    }

    // 3. Validate booking status
    if (!['Pending', 'Reserved'].includes(booking.booking_status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot initiate payment for booking with status: ${booking.booking_status}`
      });
    }

    // 4. Determine payment amount
    let paymentAmount = amount;
    if (!paymentAmount || paymentAmount <= 0) {
      // Default to balance if available, otherwise total_price
      paymentAmount = booking.balance || booking.total_price;
    }

    const amountInCentavos = Math.round(paymentAmount * 100);

    if (amountInCentavos < 100) {
      return res.status(400).json({
        success: false,
        message: "Payment amount too low (minimum 1.00 PHP)"
      });
    }

    // 5. Prepare payment metadata
    const metadata = {
      booking_id: booking.id,
      business_id: booking.business_id,
      tourist_id: booking.tourist_id,
      user_id: user_id,
      room_id: booking.room_id,
      room_name: booking.room_name || 'Room',
      total_price: booking.total_price.toString(),
      payment_amount: paymentAmount.toString(),
      payment_type: payment_type,
      payment_method_type: payment_method_type,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      source: 'mobile_app',
      payment_for: 'booking'
    };

    // 6. Build redirect URLs
    const successUrl = `${PAYMONGO_REDIRECT_BASE}/bookings/${booking.id}/payment-success`;
    const cancelUrl = `${PAYMONGO_REDIRECT_BASE}/bookings/${booking.id}/payment-cancel`;

    // 7. Create line items for checkout
    const lineItems = [
      {
        currency: 'PHP',
        amount: amountInCentavos,
        name: booking.room_name || 'Room Reservation',
        quantity: 1,
        description: `${payment_type} - Check-in: ${booking.check_in_date}, Check-out: ${booking.check_out_date}`
      }
    ];

    // 8. Create PayMongo checkout session
    const checkoutSession = await paymongoService.createCheckoutSession({
      orderId: booking.id, // Using booking ID as reference
      orderNumber: `BK-${booking.id.substring(0, 8).toUpperCase()}`,
      amount: amountInCentavos,
      lineItems,
      successUrl,
      cancelUrl,
      description: `Booking Payment - ${booking.room_name || 'Room'} at ${booking.business_name || 'Accommodation'}`,
      metadata
    });

    const provider_reference = checkoutSession.id;
    const checkout_url = checkoutSession.attributes.checkout_url;

    // 9. Create payment record
    const payment_id = uuidv4();
    const created_at = new Date();

    await db.query(
      `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment_id,
        'Tourist',                  // payer_type
        'online',                   // payment_type
        payment_method_type,        // payment_method
        paymentAmount,              // amount in PHP
        'pending',                  // status
        'booking',                  // payment_for
        user_id,                    // payer_id
        booking.id,                 // payment_for_id
        created_at
      ]
    );

    // Store provider reference
    await db.query(
      `UPDATE payment 
       SET provider_reference = ?, 
           currency = 'PHP',
           metadata = ?
       WHERE id = ?`,
      [provider_reference, JSON.stringify(metadata), payment_id]
    );

    console.log(`[BookingPayment] ✅ Checkout session created for booking ${booking.id}`);
    console.log(`[BookingPayment] 🔗 Checkout URL: ${checkout_url}`);

    // 10. Return checkout URL to client
    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        payment_id,
        booking_id: booking.id,
        amount: paymentAmount,
        currency: 'PHP',
        payment_method_type,
        payment_type,
        provider_reference,
        checkout_url,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error("[BookingPayment] Error initiating payment:", error);

    if (error.message && error.message.includes('PayMongo')) {
      return res.status(502).json({
        success: false,
        message: "Payment provider error. Please try again later."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
