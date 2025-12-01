import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";
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
