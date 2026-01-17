/**
 * Mobile Booking Controller
 * Handles ONLINE bookings for tourists via the mobile app.
 * Walk-in bookings are handled by the Business Backend (port 4000).
 */

import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";
import {
  sendNotification,
} from "../../services/notificationHelper.js";

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
  "guest_id",
];

const makePlaceholders = (n) => Array(n).fill("?").join(", ");

const buildBookingParams = (id, body, options = {}) => {
  return [
    id,
    ...BOOKING_FIELDS.map((f) => {
      if (Object.prototype.hasOwnProperty.call(body, f)) return body[f];
      if (options.defaultBalanceFor === f) return options.defaultBalanceValue;
      if (options.defaultStatusFor === f) return options.defaultStatusValue;
      return null;
    }),
  ];
};

/**
 * Get all bookings for a tourist (their own bookings)
 */
export async function getMyBookings(req, res) {
  try {
    const tourist_id = req.user?.tourist_id;
    if (!tourist_id) {
      return res.status(400).json({ error: "Tourist ID not found in user context" });
    }
    const [rows] = await db.query("CALL GetBookingsByTouristId(?)", [tourist_id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get booking by ID (tourist can only view their own bookings)
 */
export async function getBookingById(req, res) {
  try {
    const { id } = req.params;
    const tourist_id = req.user?.tourist_id;

    const [rows] = await db.query("CALL GetBookingById(?)", [id]);
    const booking = rows[0][0];

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Tourists can only view their own bookings
    if (tourist_id && booking.tourist_id !== tourist_id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Create online booking (for tourists via mobile app)
 * booking_source will be set to 'online' automatically
 */
export async function createOnlineBooking(req, res) {
  try {
    // Get tourist_id from authenticated user (set by authenticate middleware)
    const authenticatedTouristId = req.user?.tourist_id;

    if (!authenticatedTouristId) {
      return res.status(403).json({
        error: "Tourist ID not found. User may not have a tourist profile.",
        code: "NO_TOURIST_PROFILE"
      });
    }

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
      check_in_time = "14:00:00",
      check_out_time = "12:00:00",
      total_price,
      balance,
      booking_status,
      room_id,
      business_id,
    } = req.body;

    // Use authenticated tourist_id (ignore tourist_id from body for security)
    const tourist_id = authenticatedTouristId;

    // Validate required fields
    const missing = [];
    if (pax === undefined) missing.push("pax");
    if (!trip_purpose) missing.push("trip_purpose");
    if (!check_in_date) missing.push("check_in_date");
    if (!check_out_date) missing.push("check_out_date");
    if (!room_id) missing.push("room_id");
    if (total_price === undefined) missing.push("total_price");
    if (missing.length) {
      return res
        .status(400)
        .json({ error: "Missing required fields", fields: missing });
    }

    // Validate room exists
    const [roomCheck] = await db.query(
      "SELECT id, business_id FROM room WHERE id = ?",
      [room_id]
    );
    if (!roomCheck || roomCheck.length === 0) {
      console.error(`[createOnlineBooking] Room not found: ${room_id}`);
      return res.status(404).json({
        error: "Room not found",
        code: "ROOM_NOT_FOUND",
        room_id
      });
    }

    // Use business_id from room if not provided
    const effectiveBusinessId = business_id || roomCheck[0].business_id;

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

    // Set booking_source to 'online' for mobile app bookings
    // Add authenticated tourist_id to the payload
    const bodyWithDefaults = {
      ...req.body,
      business_id: effectiveBusinessId, // Use validated business_id from room
      tourist_id: authenticatedTouristId, // Use authenticated tourist_id from session
      check_in_time: req.body.check_in_time || check_in_time,
      check_out_time: req.body.check_out_time || check_out_time,
      booking_source: "online", // Always 'online' for mobile bookings
      guest_id: null, // Online bookings don't have guest_id (tourists use tourist_id)
    };

    const params = buildBookingParams(id, bodyWithDefaults, {
      defaultBalanceFor: "balance",
      defaultBalanceValue: effectiveBalance,
      defaultStatusFor: "booking_status",
      defaultStatusValue: effectiveStatus,
    });

    const placeholders = makePlaceholders(params.length);
    const [rows] = await db.query(`CALL InsertBooking(${placeholders})`, params);

    const createdBooking = rows[0][0];

    // Send notifications
    if (createdBooking) {
      try {
        const [businessData] = await db.query(
          `SELECT b.id, b.business_name, b.owner_id, o.user_id as owner_user_id
           FROM business b
           JOIN owner o ON b.owner_id = o.id
           WHERE b.id = ?`,
          [business_id]
        );
        const [roomData] = await db.query("SELECT id, room_number FROM room WHERE id = ?", [room_id]);
        const [touristData] = await db.query("CALL GetTouristById(?)", [tourist_id]);

        const businessName = businessData[0]?.business_name || "the accommodation";
        const roomNumber = roomData[0]?.room_number || "";
        const touristUserId = touristData[0]?.[0]?.user_id;
        const touristName = `${touristData[0]?.[0]?.first_name || ""} ${touristData[0]?.[0]?.last_name || ""}`.trim();
        const ownerUserId = businessData[0]?.owner_user_id;

        // Notify tourist
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

        // Notify business owner
        if (ownerUserId) {
          await sendNotification(
            ownerUserId,
            "New Online Booking",
            `${touristName || "A guest"} has booked ${roomNumber ? `Room ${roomNumber}` : "a room"} online. Check-in: ${check_in_date}.`,
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
              booking_source: "online",
            }
          );
        }
      } catch (notifError) {
        console.error("Failed to send booking notification:", notifError);
      }
    }

    return res.status(201).json(createdBooking);
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Cancel a booking (tourist can only cancel their own bookings)
 */
export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const tourist_id = req.user?.tourist_id;
    const { cancellation_reason } = req.body;

    // Get the booking first
    const [bookingRows] = await db.query("CALL GetBookingById(?)", [id]);
    const booking = bookingRows[0][0];

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Verify ownership
    if (tourist_id && booking.tourist_id !== tourist_id) {
      return res.status(403).json({ error: "You can only cancel your own bookings" });
    }

    // Check if booking can be cancelled
    if (booking.booking_status === "Cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }
    if (booking.booking_status === "Completed" || booking.booking_status === "Checked-Out") {
      return res.status(400).json({ error: "Cannot cancel a completed booking" });
    }

    // Update booking status to Cancelled
    await db.query(
      "UPDATE booking SET booking_status = 'Cancelled', updated_at = NOW() WHERE id = ?",
      [id]
    );

    // Notify business owner about cancellation
    try {
      const [businessData] = await db.query(
        `SELECT b.business_name, o.user_id as owner_user_id
         FROM business b
         JOIN owner o ON b.owner_id = o.id
         WHERE b.id = ?`,
        [booking.business_id]
      );
      const [touristData] = await db.query("CALL GetTouristById(?)", [booking.tourist_id]);
      const touristName = `${touristData[0]?.[0]?.first_name || ""} ${touristData[0]?.[0]?.last_name || ""}`.trim();

      if (businessData[0]?.owner_user_id) {
        await sendNotification(
          businessData[0].owner_user_id,
          "Booking Cancelled",
          `${touristName || "A guest"} has cancelled their booking for ${booking.check_in_date}.${cancellation_reason ? ` Reason: ${cancellation_reason}` : ""}`,
          "booking_cancelled",
          {
            booking_id: id,
            business_id: booking.business_id,
            check_in_date: booking.check_in_date,
            cancellation_reason: cancellation_reason || null,
          }
        );
      }
    } catch (notifError) {
      console.error("Failed to send cancellation notification:", notifError);
    }

    res.json({ message: "Booking cancelled successfully", booking_id: id });
  } catch (error) {
    return handleDbError(error, res);
  }
}

/**
 * Get available rooms for a date range (public endpoint for browsing)
 */
export async function getAvailableRooms(req, res) {
  try {
    const { business_id, check_in_date, check_out_date, pax } = req.query;

    if (!business_id || !check_in_date || !check_out_date) {
      return res.status(400).json({
        error: "Missing required query parameters: business_id, check_in_date, check_out_date"
      });
    }

    const [rows] = await db.query(
      "CALL GetAvailableRoomsByDateRange(?, ?, ?)",
      [business_id, check_in_date, check_out_date]
    );

    let rooms = rows[0] || [];

    // Filter by capacity if pax is provided
    if (pax) {
      rooms = rooms.filter(room => room.capacity >= parseInt(pax));
    }

    res.json(rooms);
  } catch (error) {
    return handleDbError(error, res);
  }
}
