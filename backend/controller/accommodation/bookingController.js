import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";
import { incrementPromotionUsage } from "../promotionController.js";
import { sendNotification } from "../../services/notificationHelper.js";

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

    if (body.booking_status === "Checked-out" && previousStatus !== "Checked-out" && updatedBooking) {
      console.log("[Checkout] Status changed to Checked-Out, sending notification...");
      try {
        // Get business, room, and tourist details for the notification
        const [businessData] = await db.query("SELECT id, business_name FROM business WHERE id = ?", [updatedBooking.business_id]);
        const [roomData] = await db.query("SELECT id, room_number FROM room WHERE id = ?", [updatedBooking.room_id]);
        const [touristData] = await db.query("CALL GetTouristById(?)", [updatedBooking.tourist_id]);

        console.log("[Checkout] Tourist data result:", JSON.stringify(touristData));

        const businessName = businessData[0]?.business_name || "the accommodation";
        const roomNumber = roomData[0]?.room_number || "";
        const userId = touristData[0]?.[0]?.user_id;

        console.log("[Checkout] Notification details:", { businessName, roomNumber, userId, touristId: updatedBooking.tourist_id });

        if (userId) {
          console.log("[Checkout] Calling sendNotification for userId:", userId);
          const notificationData = {
            recipientId: userId,
            title: "Booking Completed",
            message: `Thank you for staying with us at ${businessName}! We hope you had a wonderful experience. We'd love to hear your feedback - please rate your stay.`,
            type: "booking_completed",
            metadata: {
              booking_id: id,
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
      } catch (notifError) {
        console.error("[Checkout] Failed to send checkout notification:", notifError);
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
    await db.query("CALL DeleteBooking(?)", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
