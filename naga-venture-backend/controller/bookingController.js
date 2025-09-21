import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";
// Get all bookings
export async function getAllBookings(req, res) {
  try {
    const [rows] = await db.query("CALL GetAllBookings()");
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

// Insert booking
export async function insertBooking(req, res) {
  try {
    const {
      id = uuidv4(),
      pax,
      num_children = 0,
      num_adults = 0,
      foreign_counts = 0,
      domestic_counts = 0,
      overseas_counts = 0,
      local_counts = 0,
      trip_purpose,
      check_in_date,
      check_out_date,
      total_price,
      balance,
      booking_status,
      room_id,
      tourist_id,
    } = req.body;

    // Basic validation (kept lightweight; expand as needed)
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

    const effectiveBalance = balance ?? total_price; // assume full balance due if not provided
    const effectiveStatus = booking_status ?? "Pending"; // matches procedure default

    const [rows] = await db.query(
      // 16 placeholders matching 16 parameters in InsertBooking
      "CALL InsertBooking(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        pax,
        num_children,
        num_adults,
        foreign_counts,
        domestic_counts,
        overseas_counts,
        local_counts,
        trip_purpose,
        check_in_date,
        check_out_date,
        total_price,
        effectiveBalance,
        effectiveStatus,
        room_id,
        tourist_id,
      ]
    );
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

    const {
      pax,
      num_children,
      num_adults,
      foreign_counts,
      domestic_counts,
      overseas_counts,
      local_counts,
      trip_purpose,
      check_in_date,
      check_out_date,
      total_price,
      balance,
      booking_status,
      room_id,
      tourist_id,
    } = req.body;

    const [rows] = await db.query(
      // 16 placeholders matching UpdateBooking signature
      "CALL UpdateBooking(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        pax ?? null,
        num_children ?? null,
        num_adults ?? null,
        foreign_counts ?? null,
        domestic_counts ?? null,
        overseas_counts ?? null,
        local_counts ?? null,
        trip_purpose ?? null,
        check_in_date ?? null,
        check_out_date ?? null,
        total_price ?? null,
        balance ?? null,
        booking_status ?? null,
        room_id ?? null,
        tourist_id ?? null,
      ]
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
