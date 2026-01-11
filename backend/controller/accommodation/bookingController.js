import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";
import { incrementPromotionUsage } from "../promotion/promotionController.js";
import {
  sendNotification,
  notifyBookingCancelled,
  notifyBookingReminder
} from "../../services/notificationHelper.js";

import { sendPushNotification } from "../../services/expoPushService.js";

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
  "booking_source",
  "guest_name",
  "guest_phone",
  "guest_email",
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

// Get available rooms by business ID and date range
export async function getAvailableRoomsByDateRange(req, res) {
  try {
    const { business_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date and end_date are required" });
    }

    const [rows] = await db.query("CALL GetAvailableRoomsByDateRange(?, ?, ?)", [
      business_id,
      start_date,
      end_date,
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

    const createdBooking = rows[0][0];

    // Send system-generated notification to the tourist after successful booking
    if (createdBooking) {
      try {
        // Get business and room details for the notification
        const [businessData] = await db.query(
          `SELECT b.id, b.business_name, b.owner_id, o.user_id as owner_user_id, o.first_name as owner_first_name
           FROM business b
           JOIN owner o ON b.owner_id = o.id
           WHERE b.id = ?`,
          [business_id]
        );
        const [roomData] = await db.query("SELECT id, room_number FROM room WHERE id = ?", [room_id]);
        const [touristData] = await db.query("CALL GetTouristById(?)", [tourist_id]);
        const [userData] = await db.query("CALL GetUserById(?)", [touristData[0]?.[0]?.user_id]);

        const businessName = businessData[0]?.business_name || "the accommodation";
        const roomNumber = roomData[0]?.room_number || "";
        const touristUserId = touristData[0]?.[0]?.user_id;
        const touristName = `${touristData[0]?.[0]?.first_name || ""} ${touristData[0]?.[0]?.last_name || ""}`.trim();
        const ownerUserId = businessData[0]?.owner_user_id;
        const userProfile = userData[0]?.[0].user_profile || null;

        // Send notification to tourist - Booking Confirmed
        if (touristUserId) {
          await sendNotification(
            touristUserId,
            "Booking Confirmed",
            `Your booking at ${businessName}${roomNumber ? ` (Room ${roomNumber})` : ""} has been successfully secured.`,
            "booking_confirmed",
            {
              booking_id: id,
              business_id: business_id,
              business_name: businessName,
              room_id: room_id,
              room_number: roomNumber,
              check_in_date: check_in_date,
              check_out_date: check_out_date,
            }
          );
        }

        // Send notification to business owner - New Booking
        if (ownerUserId) {
          await sendNotification(
            ownerUserId,
            "New Booking Received",
            `${touristName || "A guest"} has booked ${roomNumber ? `Room ${roomNumber}` : "a room"}. Check-in: ${check_in_date}.`,
            "booking_created",
            {
              booking_id: id,
              business_id: business_id,
              business_name: businessName,
              room_id: room_id,
              room_number: roomNumber,
              check_in_date: check_in_date,
              check_out_date: check_out_date,
              guest_name: touristName,
              total_price: total_price,
              user_profile: userProfile,
            }
          );
        }
      } catch (notifError) {
        console.error("Failed to send booking notification:", notifError);
        // Don't fail the booking if notification fails
      }
    }

    return res.status(201).json(createdBooking);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update booking
export async function updateBooking(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "id parameter is required" });

    // Get the current booking to check for status change
    const [currentBooking] = await db.query("CALL GetBookingById(?)", [id]);
    const previousStatus = currentBooking[0]?.[0]?.booking_status;

    const body = req.body || {};
    const params = [
      id,
      ...BOOKING_FIELDS.map((f) => (Object.prototype.hasOwnProperty.call(body, f) ? body[f] : null)),
    ];
    const placeholders = makePlaceholders(params.length);
    const [rows] = await db.query(`CALL UpdateBooking(${placeholders})`, params);

    const updatedBooking = rows[0]?.[0];

    // Send notification if status changed to "Checked-out"
    console.log("[Checkout] Checking notification conditions:", {
      newStatus: body.booking_status,
      previousStatus,
      hasUpdatedBooking: !!updatedBooking,
    });

    // Handle booking status notifications
    if (updatedBooking && body.booking_status && body.booking_status !== previousStatus) {
      try {
        // Get business, room, and tourist details for notifications
        const [businessData] = await db.query("SELECT id, business_name FROM business WHERE id = ?", [updatedBooking.business_id]);
        const [roomData] = await db.query("SELECT id, room_number FROM room WHERE id = ?", [updatedBooking.room_id]);
        const [touristData] = await db.query("CALL GetTouristById(?)", [updatedBooking.tourist_id]);

        const businessName = businessData[0]?.business_name || "the accommodation";
        const roomNumber = roomData[0]?.room_number || "";
        const userId = touristData[0]?.[0]?.user_id;

        // Checked-out notification
        if (body.booking_status === "Checked-out" && previousStatus !== "Checked-out") {
          console.log("[Checkout] Status changed to Checked-Out, sending notification...");
          console.log("[Checkout] Tourist data result:", JSON.stringify(touristData));

          if (userId) {
            console.log("[Checkout] Calling sendNotification for userId:", userId);
            const notificationData = {
              recipientId: userId,
              title: "Booking Completed",
              message: `Thank you for staying with us at ${businessName}! We hope you had a wonderful experience. We'd love to hear your feedback - please rate your stay.`,
              type: "booking_completed",
              metadata: {
                booking_id: updatedBooking.id,
                business_id: updatedBooking.business_id,
                business_name: businessName,
                room_id: updatedBooking.room_id,
                room_number: roomNumber,
              }
            };

            console.log("[Checkout] ====== NOTIFICATION DETAILS ======");
            console.log("[Checkout] Recipient User ID:", notificationData.recipientId);
            console.log("[Checkout] Title:", notificationData.title);
            console.log("[Checkout] Message:", notificationData.message);
            console.log("[Checkout] Type:", notificationData.type);
            console.log("[Checkout] Metadata:", JSON.stringify(notificationData.metadata, null, 2));
            console.log("[Checkout] ===================================");

            await sendNotification(
              notificationData.recipientId,
              notificationData.title,
              notificationData.message,
              notificationData.type,
              notificationData.metadata
            );

            console.log("[Checkout] ✅ Notification sent successfully to user:", userId);
          } else {
            console.log("[Checkout] No userId found, skipping notification");
          }
        }

        // Cancelled notification
        if (body.booking_status === "Canceled" && previousStatus !== "Canceled" && userId) {
          console.log("[Booking] Status changed to Canceled, sending notification...");

          const cancelledBy = body.cancelled_by || 'business';
          const cancelTitle = "Booking Canceled";
          const cancelMessage = cancelledBy === 'user'
            ? 'Your booking has been successfully canceled.'
            : `${businessName} has canceled your booking.`;

          // Send database notification with push notification
          await sendNotification(
            userId,
            cancelTitle,
            cancelMessage,
            "booking_cancelled",
            {
              booking_id: updatedBooking.id,
              business_id: updatedBooking.business_id,
              business_name: businessName,
              cancelled_by: cancelledBy
            }
          );

          console.log("[Booking] ✅ Cancellation notification sent to user:", userId);
        }

        if (body.booking_status === "Checked-in" && previousStatus !== "Checked-in") {
          console.log("[Checkin] Status changed to Checked-In, sending notification...");
          console.log("[Checkin] Tourist data result:", JSON.stringify(touristData));

          if (userId) {
            console.log("[Checkin] Calling sendNotification for userId:", userId);
            const notificationData = {
              recipientId: userId,
              title: "Checked In",
              message: `You have successfully checked in at ${businessName}. Enjoy your stay!`,
              type: "booking_in_progress",
              metadata: {
                booking_id: updatedBooking.id,
                business_id: updatedBooking.business_id,
                business_name: businessName,
                room_id: updatedBooking.room_id,
                room_number: roomNumber,
              }
            };

            console.log("[Checkout] ====== NOTIFICATION DETAILS ======");
            console.log("[Checkout] Recipient User ID:", notificationData.recipientId);
            console.log("[Checkout] Title:", notificationData.title);
            console.log("[Checkout] Message:", notificationData.message);
            console.log("[Checkout] Type:", notificationData.type);
            console.log("[Checkout] Metadata:", JSON.stringify(notificationData.metadata, null, 2));
            console.log("[Checkout] ===================================");

            await sendNotification(
              notificationData.recipientId,
              notificationData.title,
              notificationData.message,
              notificationData.type,
              notificationData.metadata
            );

            console.log("[Checkout] ✅ Notification sent successfully to user:", userId);
          } else {
            console.log("[Checkout] No userId found, skipping notification");
          }
        }

      } catch (notifError) {
        console.error("[Booking] Failed to send status change notification:", notifError);
        // Don't fail the update if notification fails
      }
    }

    return res.json(updatedBooking);
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

    // Get booking details before deletion for notification
    const [bookingData] = await db.query("CALL GetBookingById(?)", [id]);
    const booking = bookingData[0]?.[0];

    if (booking) {
      // Get business and tourist info
      const [businessData] = await db.query("SELECT id, business_name FROM business WHERE id = ?", [booking.business_id]);
      const [touristData] = await db.query("CALL GetTouristById(?)", [booking.tourist_id]);
      const userId = touristData[0]?.[0]?.user_id;
      const businessName = businessData[0]?.business_name || "the accommodation";

      // Delete the booking
      await db.query("CALL DeleteBooking(?)", [id]);

      // Send cancellation notifications
      if (userId) {
        await notifyBookingCancelled({
          id: booking.id,
          user_id: userId,
          business_id: booking.business_id,
          business_name: businessName
        }, 'user');

        // Send push notification
        await sendPushNotification(
          userId,
          "Booking Cancelled",
          "Your booking has been cancelled successfully.",
          {
            booking_id: booking.id,
            business_id: booking.business_id,
            business_name: businessName,
            cancelled_by: 'user'
          },
          "booking_cancelled"
        );
      }
    } else {
      await db.query("CALL DeleteBooking(?)", [id]);
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Create a walk-in booking (onsite check-in)
 * This endpoint allows staff to create a booking for guests who arrive without prior reservation
 */
export async function createWalkInBooking(req, res) {
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
      trip_purpose = "Leisure",
      booking_type = "overnight",
      check_in_date,
      check_out_date,
      check_in_time = "14:00:00",
      check_out_time = "12:00:00",
      total_price,
      balance = 0,
      room_id,
      business_id,
      // Walk-in specific fields
      guest_name,
      guest_phone,
      guest_email,
      tourist_id = null, // Optional - if guest has an existing account
      immediate_checkin = true, // Default to immediate check-in for walk-ins
    } = req.body;

    // Validation
    const missing = [];
    if (pax === undefined) missing.push("pax");
    if (!check_in_date) missing.push("check_in_date");
    if (!check_out_date) missing.push("check_out_date");
    if (!room_id) missing.push("room_id");
    if (!business_id) missing.push("business_id");
    if (total_price === undefined) missing.push("total_price");
    // For walk-ins without tourist_id, require guest_name
    if (!tourist_id && !guest_name) missing.push("guest_name (required for walk-in without tourist account)");

    if (missing.length) {
      return res.status(400).json({ error: "Missing required fields", fields: missing });
    }

    // Check room availability
    const [availCheck] = await db.query("CALL CheckRoomAvailability(?, ?, ?)", [
      room_id,
      check_in_date,
      check_out_date,
    ]);
    const availStatus = availCheck[0]?.[0]?.availability_status;
    if (availStatus !== "AVAILABLE") {
      return res.status(409).json({
        error: "Room is not available for the selected dates",
        status: availStatus,
      });
    }

    // Set booking status based on immediate_checkin flag
    const booking_status = immediate_checkin ? "Checked-In" : "Reserved";
    const booking_source = "walk-in";

    const bodyWithDefaults = {
      pax,
      num_children,
      num_adults,
      num_infants,
      foreign_counts,
      domestic_counts,
      overseas_counts,
      local_counts,
      trip_purpose,
      booking_type,
      check_in_date,
      check_out_date,
      check_in_time,
      check_out_time,
      total_price,
      balance,
      booking_status,
      room_id,
      tourist_id,
      business_id,
      booking_source,
      guest_name,
      guest_phone,
      guest_email,
    };

    const params = buildBookingParams(id, bodyWithDefaults);
    const placeholders = makePlaceholders(params.length);
    const [rows] = await db.query(`CALL InsertBooking(${placeholders})`, params);

    const createdBooking = rows[0][0];

    // Update room status to Occupied if immediate check-in
    if (immediate_checkin && createdBooking) {
      await db.query("UPDATE room SET status = 'Occupied' WHERE id = ?", [room_id]);
    }

    // Send notification to tourist if they have an account
    if (createdBooking && tourist_id) {
      try {
        const [businessData] = await db.query("SELECT id, business_name FROM business WHERE id = ?", [business_id]);
        const [roomData] = await db.query("SELECT id, room_number FROM room WHERE id = ?", [room_id]);
        const [touristData] = await db.query("CALL GetTouristById(?)", [tourist_id]);

        const businessName = businessData[0]?.business_name || "the accommodation";
        const roomNumber = roomData[0]?.room_number || "";
        const touristUserId = touristData[0]?.[0]?.user_id;

        if (touristUserId) {
          const notifTitle = immediate_checkin ? "Walk-In Check-In Completed" : "Walk-In Booking Confirmed";
          const notifMessage = immediate_checkin
            ? `You have been checked in at ${businessName}${roomNumber ? ` (Room ${roomNumber})` : ""}. Enjoy your stay!`
            : `Your walk-in booking at ${businessName}${roomNumber ? ` (Room ${roomNumber})` : ""} has been confirmed.`;

          await sendNotification(
            touristUserId,
            notifTitle,
            notifMessage,
            immediate_checkin ? "booking_in_progress" : "booking_confirmed",
            {
              booking_id: id,
              business_id,
              business_name: businessName,
              room_id,
              room_number: roomNumber,
              check_in_date,
              check_out_date,
              booking_source: "walk-in",
            }
          );
        }
      } catch (notifError) {
        console.error("Failed to send walk-in booking notification:", notifError);
      }
    }

    return res.status(201).json({
      ...createdBooking,
      message: immediate_checkin
        ? "Walk-in guest checked in successfully"
        : "Walk-in booking created successfully",
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Search for guests (tourists) by name, phone, or email
 * Used for walk-in bookings to find existing guest accounts
 */
export async function searchGuests(req, res) {
  try {
    const { query, business_id } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }

    const searchTerm = `%${query}%`;

    // Search in tourist and users tables
    const [rows] = await db.query(`
      SELECT
        t.id as tourist_id,
        t.user_id,
        t.first_name,
        t.last_name,
        CONCAT(t.first_name, ' ', t.last_name) as full_name,
        u.email,
        u.phone_number,
        u.user_profile
      FROM tourist t
      JOIN users u ON t.user_id = u.id
      WHERE
        CONCAT(t.first_name, ' ', t.last_name) LIKE ?
        OR t.first_name LIKE ?
        OR t.last_name LIKE ?
        OR u.email LIKE ?
        OR u.phone_number LIKE ?
      ORDER BY t.first_name, t.last_name
      LIMIT 20
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]);

    // Optionally get booking history for each guest at this business
    if (business_id) {
      for (const guest of rows) {
        const [bookings] = await db.query(`
          SELECT COUNT(*) as total_bookings, MAX(created_at) as last_booking
          FROM booking
          WHERE tourist_id = ? AND business_id = ?
        `, [guest.tourist_id, business_id]);
        guest.booking_history = bookings[0];
      }
    }

    res.json(rows);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Get today's arrivals (bookings with check-in date today)
 */
export async function getTodaysArrivals(req, res) {
  try {
    const { business_id } = req.params;

    if (!business_id) {
      return res.status(400).json({ error: "business_id is required" });
    }

    const today = new Date().toISOString().split('T')[0];

    const [rows] = await db.query(`
      SELECT
        b.*,
        r.room_number,
        r.room_type,
        t.first_name as tourist_first_name,
        t.last_name as tourist_last_name,
        u.email as tourist_email,
        u.phone_number as tourist_phone
      FROM booking b
      LEFT JOIN room r ON b.room_id = r.id
      LEFT JOIN tourist t ON b.tourist_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE b.business_id = ?
        AND b.check_in_date = ?
        AND b.booking_status IN ('Pending', 'Reserved')
      ORDER BY b.check_in_time ASC
    `, [business_id, today]);

    res.json({
      date: today,
      total: rows.length,
      arrivals: rows,
    });
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Get today's departures (bookings with check-out date today)
 */
export async function getTodaysDepartures(req, res) {
  try {
    const { business_id } = req.params;

    if (!business_id) {
      return res.status(400).json({ error: "business_id is required" });
    }

    const today = new Date().toISOString().split('T')[0];

    const [rows] = await db.query(`
      SELECT
        b.*,
        r.room_number,
        r.room_type,
        t.first_name as tourist_first_name,
        t.last_name as tourist_last_name,
        u.email as tourist_email,
        u.phone_number as tourist_phone
      FROM booking b
      LEFT JOIN room r ON b.room_id = r.id
      LEFT JOIN tourist t ON b.tourist_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE b.business_id = ?
        AND b.check_out_date = ?
        AND b.booking_status = 'Checked-In'
      ORDER BY b.check_out_time ASC
    `, [business_id, today]);

    res.json({
      date: today,
      total: rows.length,
      departures: rows,
    });
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Get currently occupied rooms for a business
 */
export async function getCurrentlyOccupied(req, res) {
  try {
    const { business_id } = req.params;

    if (!business_id) {
      return res.status(400).json({ error: "business_id is required" });
    }

    const [rows] = await db.query(`
      SELECT
        b.*,
        r.room_number,
        r.room_type,
        r.floor,
        COALESCE(CONCAT(t.first_name, ' ', t.last_name), b.guest_name) as guest_name,
        COALESCE(u.phone_number, b.guest_phone) as guest_phone,
        DATEDIFF(b.check_out_date, CURDATE()) as nights_remaining
      FROM booking b
      LEFT JOIN room r ON b.room_id = r.id
      LEFT JOIN tourist t ON b.tourist_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE b.business_id = ?
        AND b.booking_status = 'Checked-In'
      ORDER BY r.room_number ASC
    `, [business_id]);

    res.json({
      total: rows.length,
      occupied: rows,
    });
  } catch (err) {
    handleDbError(err, res);
  }
}
