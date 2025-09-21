// Get all guests
export async function getAllGuests(req, res) {
  try {
    const [rows] = await db.query("CALL GetAllGuests()");
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get guest by ID
export async function getGuestById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query("CALL GetGuestById(?)", [id]);
    res.json(rows[0][0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Insert guest
export async function insertGuest(req, res) {
  try {
    const { id = uuidv4(), name, age, gender, booking_id } = req.body;
    const [rows] = await db.query("CALL InsertGuest(?, ?, ?, ?, ?)", [
      id,
      name,
      age,
      gender,
      booking_id,
    ]);
    res.status(201).json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update guest
export async function updateGuest(req, res) {
  try {
    const { id } = req.params;
    const { name, age, gender } = req.body;
    const [rows] = await db.query("CALL UpdateGuest(?, ?, ?, ?)", [
      id,
      name,
      age,
      gender,
    ]);
    res.json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// Delete guest
export async function deleteGuest(req, res) {
  try {
    const { id } = req.params;
    await db.query("CALL DeleteGuest(?)", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get guests by booking ID
export async function getGuestsByBookingId(req, res) {
  try {
    const { booking_id } = req.params;
    const [rows] = await db.query("CALL GetGuestByBookingId(?)", [booking_id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
