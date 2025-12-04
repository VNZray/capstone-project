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
 *   amount?: number (optional - defaults to booking total_price or balance),
 *   bookingData?: object (optional - if booking doesn't exist yet, create it first)
 * }
 * Auth: Required (Tourist role)
 */
export async function initiateBookingPayment(req, res) {
  try {
    const { id: booking_id } = req.params;
    const { payment_method_type = 'gcash', payment_type = 'Full Payment', amount, bookingData } = req.body;
    const user_id = req.user?.id;

    // Validate user authentication
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    let booking;
    let bookingCreated = false;

    // Check if booking exists, or create it from bookingData
    if (booking_id && booking_id !== 'pending' && !booking_id.startsWith('pending_')) {
      // 1. Fetch existing booking details
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

      booking = bookingRows[0];

      // 2. Validate ownership - tourist_id should match the authenticated user's tourist record
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
    } else if (bookingData) {
      // CREATE NEW BOOKING from provided data
      console.log('[BookingPayment] Creating new booking before payment initiation');

      const id = uuidv4();
      const {
        pax,
        num_children = 0,
        num_adults = 0,
        num_infants = 0,
        foreign_counts = 0,
        domestic_counts = 0,
        overseas_counts = 0,
        local_counts = 0,
        trip_purpose,
        booking_type = 'overnight',
        check_in_date,
        check_out_date,
        check_in_time = '14:00:00',
        check_out_time = '12:00:00',
        total_price,
        balance,
        room_id,
        tourist_id,
        business_id,
      } = bookingData;

      // If tourist_id is actually a user_id, fetch the tourist_id
      let actualTouristId = tourist_id;
      if (tourist_id) {
        // Check if this is a user_id by querying the tourist table
        const [touristCheck] = await db.query(
          `SELECT id FROM tourist WHERE user_id = ? OR id = ?`,
          [tourist_id, tourist_id]
        );
        if (touristCheck && touristCheck.length > 0) {
          actualTouristId = touristCheck[0].id;
        }
      }

      // Validate required fields
      const missing = [];
      if (pax === undefined) missing.push('pax');
      if (!trip_purpose) missing.push('trip_purpose');
      if (!check_in_date) missing.push('check_in_date');
      if (!check_out_date) missing.push('check_out_date');
      if (!room_id) missing.push('room_id');
      if (!actualTouristId) missing.push('tourist_id');
      if (total_price === undefined) missing.push('total_price');
      if (missing.length) {
        return res.status(400).json({
          success: false,
          error: 'Missing required booking fields',
          fields: missing
        });
      }

      const effectiveBalance = balance ?? total_price;
      const effectiveStatus = 'Reserved'; // Reserved until payment completes

      const params = buildBookingParams(id, {
        ...bookingData,
        tourist_id: actualTouristId, // Use the actual tourist_id
        check_in_time: bookingData.check_in_time || check_in_time,
        check_out_time: bookingData.check_out_time || check_out_time,
      }, {
        defaultBalanceFor: 'balance',
        defaultBalanceValue: effectiveBalance,
        defaultStatusFor: 'booking_status',
        defaultStatusValue: effectiveStatus,
      });

      const placeholders = makePlaceholders(params.length);

      try {
        await db.query(`CALL InsertBooking(${placeholders})`, params);
        bookingCreated = true;

        // Fetch the created booking
        const [newBookingRows] = await db.query(
          `SELECT
            b.id, b.total_price, b.balance, b.booking_status, b.tourist_id, b.business_id, b.room_id,
            b.check_in_date, b.check_out_date, b.pax,
            CONCAT(r.room_type, ' - ', r.room_number) as room_name, r.room_price as price_per_night,
            bus.business_name
           FROM booking b
           LEFT JOIN room r ON b.room_id = r.id
           LEFT JOIN business bus ON b.business_id = bus.id
           WHERE b.id = ?`,
          [id]
        );

        booking = newBookingRows[0];
        console.log(`[BookingPayment] ✅ Booking ${id} created successfully`);
      } catch (createErr) {
        console.error('[BookingPayment] Failed to create booking:', createErr);
        return res.status(500).json({
          success: false,
          message: "Failed to create booking"
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Either provide a valid booking_id or bookingData to create a new booking"
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
      // If booking was just created, delete it
      if (bookingCreated) {
        await db.query(`CALL DeleteBooking(?)`, [booking.id]);
      }
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

    // 6. Build return URL for PIPM flow (user redirected here after payment auth)
    const returnUrl = `${PAYMONGO_REDIRECT_BASE}/bookings/${booking.id}/payment-success`;

    let pipmResult;
    try {
      // 7. Create payment using PIPM flow (Payment Intent + Payment Method)
      pipmResult = await paymongoService.createPIPMPayment({
        referenceId: booking.id,
        amount: amountInCentavos,
        paymentMethodType: payment_method_type,
        description: `Booking Payment - ${booking.room_name || 'Room'} at ${booking.business_name || 'Accommodation'}`,
        returnUrl,
        billing: {
          name: metadata.tourist_id || 'Guest',
          email: req.user?.email
        },
        metadata
      });
    } catch (paymentError) {
      console.error('[BookingPayment] Payment initiation failed:', paymentError);

      // If booking was just created and payment failed, delete the booking
      if (bookingCreated) {
        try {
          await db.query(`CALL DeleteBooking(?)`, [booking.id]);
          console.log(`[BookingPayment] 🗑️ Deleted booking ${booking.id} due to payment initiation failure`);
        } catch (deleteErr) {
          console.error(`[BookingPayment] Failed to delete booking ${booking.id}:`, deleteErr);
        }
      }

      return res.status(502).json({
        success: false,
        message: "Payment provider error. Please try again later."
      });
    }

    const provider_reference = pipmResult.paymentIntentId;
    const checkout_url = pipmResult.redirectUrl;

    // 8. Create payment record
    const payment_id = uuidv4();
    const created_at = new Date();

    // Determine payment type: Full Payment if amount >= total_price, else Partial Payment
    const isFullPayment = paymentAmount >= booking.total_price;
    const actualPaymentType = isFullPayment ? 'Full Payment' : 'Partial Payment';

    await db.query(
      `CALL InsertPayment(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment_id,
        'Tourist',                  // payer_type
        actualPaymentType,          // payment_type (Full Payment or Partial Payment)
        payment_method_type,        // payment_method
        paymentAmount,              // amount in PHP
        'pending',                  // status
        'booking',                  // payment_for
        user_id,                    // payer_id
        booking.id,                 // payment_for_id
        created_at
      ]
    );

    // Store provider reference (Payment Intent ID) and metadata
    await db.query(
      `UPDATE payment
       SET provider_reference = ?,
           currency = 'PHP',
           metadata = ?
       WHERE id = ?`,
      [provider_reference, JSON.stringify({
        ...metadata,
        payment_method_id: pipmResult.paymentMethodId,
        client_key: pipmResult.clientKey,
        status: pipmResult.status,
        booking_created_in_flow: bookingCreated
      }), payment_id]
    );

    console.log(`[BookingPayment] ✅ PIPM payment created for booking ${booking.id}`);
    console.log(`[BookingPayment] 🔗 Redirect URL: ${checkout_url}`);

    // 9. Return redirect URL to client
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
        status: 'pending',
        booking_created: bookingCreated
      }
    });

  } catch (error) {
    console.error("[BookingPayment] Error initiating payment:", error);
    console.error("[BookingPayment] Error stack:", error.stack);
    console.error("[BookingPayment] Error details:", {
      message: error.message,
      code: error.code,
      response: error.response?.data
    });

    // If payment creation failed and booking was just created, clean up the booking
    try {
      const { id: booking_id } = req.params;
      // Only attempt cleanup if we have a valid booking_id (not 'pending_*')
      if (booking_id && booking_id !== 'pending' && !booking_id.startsWith('pending_')) {
        const [bookingRows] = await db.query(
          `SELECT id, booking_status FROM booking WHERE id = ?`,
          [booking_id]
        );

        if (bookingRows && bookingRows.length > 0) {
          const booking = bookingRows[0];
          // Only delete if booking is still in Reserved or Pending status (not yet confirmed)
          if (['Reserved', 'Pending'].includes(booking.booking_status)) {
            await db.query(`CALL DeleteBooking(?)`, [booking_id]);
            console.log(`[BookingPayment] 🗑️ Deleted booking ${booking_id} due to payment failure`);
          }
        }
      }
    } catch (cleanupError) {
      console.error("[BookingPayment] Error cleaning up booking:", cleanupError);
    }

    if (error.message && error.message.includes('PayMongo')) {
      return res.status(502).json({
        success: false,
        message: "Payment provider error. Please try again later.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        code: error.code
      } : undefined
    });
  }
}

/**
 * Verify payment status for a booking
 * GET /api/bookings/:id/verify-payment/:paymentId
 *
 * This endpoint checks the actual PayMongo Payment Intent status
 * to confirm whether a payment was successful or failed.
 *
 * Auth: Required (Tourist role)
 */
export async function verifyBookingPayment(req, res) {
  try {
    const { id: booking_id, paymentId } = req.params;
    const user_id = req.user?.id;

    // Validate user authentication
    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // 1. Fetch booking and payment details
    const [rows] = await db.query(
      `SELECT
        b.id as booking_id, b.tourist_id, b.booking_status, b.total_price, b.balance,
        p.id as payment_id, p.provider_reference, p.status as payment_status, p.amount,
        t.user_id as tourist_user_id
       FROM booking b
       LEFT JOIN payment p ON p.payment_for_id = b.id AND p.payment_for = 'booking'
       LEFT JOIN tourist t ON b.tourist_id = t.id
       WHERE b.id = ? AND p.id = ?`,
      [booking_id, paymentId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking or payment not found"
      });
    }

    const record = rows[0];

    // 2. Validate ownership
    if (record.tourist_user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this payment"
      });
    }

    // 3. Check if we have a PayMongo Payment Intent ID
    const paymentIntentId = record.provider_reference;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "No payment provider reference found"
      });
    }

    // 4. Query PayMongo for actual payment status
    console.log(`[VerifyPayment] Checking PayMongo status for PI: ${paymentIntentId}`);
    const paymentIntent = await paymongoService.getPaymentIntent(paymentIntentId);
    const piStatus = paymentIntent?.attributes?.status;
    const lastPaymentError = paymentIntent?.attributes?.last_payment_error;

    console.log(`[VerifyPayment] PayMongo status: ${piStatus}`);

    // 5. Determine payment outcome
    // PayMongo Payment Intent statuses:
    // - awaiting_payment_method: Payment method not yet attached or failed
    // - awaiting_next_action: Waiting for 3DS or redirect completion
    // - processing: Payment is being processed
    // - succeeded: Payment was successful

    let verified = false;
    let paymentVerified = 'pending';
    let message = '';

    switch (piStatus) {
      case 'succeeded':
        verified = true;
        paymentVerified = 'success';
        message = 'Payment verified successfully';
        break;

      case 'awaiting_payment_method':
        // Payment failed or was cancelled - need new payment method
        verified = false;
        paymentVerified = 'failed';
        message = lastPaymentError?.message || 'Payment was cancelled or declined. Please try again.';
        break;

      case 'awaiting_next_action':
        // Still waiting for user action
        verified = false;
        paymentVerified = 'pending';
        message = 'Payment is still pending user authorization';
        break;

      case 'processing':
        // Payment is processing
        verified = false;
        paymentVerified = 'processing';
        message = 'Payment is being processed. Please wait...';
        break;

      default:
        verified = false;
        paymentVerified = 'unknown';
        message = `Unexpected payment status: ${piStatus}`;
    }

    // 6. Update local payment record if verified successful
    if (verified && record.payment_status === 'pending') {
      await db.query(
        `UPDATE payment SET status = 'paid' WHERE id = ?`,
        [paymentId]
      );

      // Update booking status to Confirmed
      await db.query(
        `UPDATE booking SET booking_status = 'Confirmed' WHERE id = ? AND booking_status IN ('Pending', 'Reserved')`,
        [booking_id]
      );

      console.log(`[VerifyPayment] ✅ Payment ${paymentId} verified and marked as paid`);
      console.log(`[VerifyPayment] ✅ Booking ${booking_id} confirmed`);
    } else if (paymentVerified === 'failed' && record.payment_status === 'pending') {
      // Mark local payment as failed
      await db.query(
        `UPDATE payment SET status = 'failed' WHERE id = ?`,
        [paymentId]
      );

      // Delete the booking if payment failed (only if still in Reserved/Pending status)
      if (['Reserved', 'Pending'].includes(record.booking_status)) {
        await db.query(`CALL DeleteBooking(?)`, [booking_id]);
        console.log(`[VerifyPayment] ❌ Payment ${paymentId} marked as failed`);
        console.log(`[VerifyPayment] 🗑️ Booking ${booking_id} deleted due to payment failure`);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        verified,
        payment_status: paymentVerified,
        message,
        payment_intent_status: piStatus,
        booking_id,
        payment_id: paymentId,
        amount: record.amount,
        last_payment_error: lastPaymentError
      }
    });

  } catch (error) {
    console.error("[VerifyPayment] Error:", error);

    // Handle PayMongo API errors
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: "Payment intent not found on PayMongo"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
