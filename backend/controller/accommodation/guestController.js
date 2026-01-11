import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get all guests
 */
export const getAllGuests = async (req, res) => {
  try {
    const [guests] = await db.query("CALL GetAllGuests()");
    res.json(guests[0]);
  } catch (error) {
    console.error("Error fetching guests:", error);
    res.status(500).json({ error: "Failed to fetch guests" });
  }
};

/**
 * Get guest by ID
 */
export const getGuestById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("CALL GetGuestById(?)", [id]);

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json(result[0][0]);
  } catch (error) {
    console.error("Error fetching guest:", error);
    res.status(500).json({ error: "Failed to fetch guest" });
  }
};

/**
 * Search guests by name, phone, or email
 */
export const searchGuests = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }

    const [result] = await db.query("CALL SearchGuests(?)", [query.trim()]);
    res.json(result[0]);
  } catch (error) {
    console.error("Error searching guests:", error);
    res.status(500).json({ error: "Failed to search guests" });
  }
};

/**
 * Get guest by phone number
 */
export const getGuestByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const [result] = await db.query("CALL GetGuestByPhone(?)", [phone]);

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json(result[0][0]);
  } catch (error) {
    console.error("Error fetching guest by phone:", error);
    res.status(500).json({ error: "Failed to fetch guest" });
  }
};

/**
 * Get guest by email
 */
export const getGuestByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const [result] = await db.query("CALL GetGuestByEmail(?)", [email]);

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json(result[0][0]);
  } catch (error) {
    console.error("Error fetching guest by email:", error);
    res.status(500).json({ error: "Failed to fetch guest" });
  }
};

/**
 * Create new guest
 */
export const createGuest = async (req, res) => {
  try {
    const { first_name, middle_name, last_name, gender, ethnicity, email, phone_number } = req.body;

    // Validation
    if (!first_name || !last_name) {
      return res.status(400).json({ error: "First name and last name are required" });
    }

    const guestId = uuidv4();

    const [result] = await db.query(
      "CALL InsertGuest(?, ?, ?, ?, ?, ?, ?, ?)",
      [guestId, first_name, middle_name || null, last_name, gender || null, ethnicity || null, email || null, phone_number || null]
    );

    res.status(201).json(result[0][0]);
  } catch (error) {
    console.error("Error creating guest:", error);
    res.status(500).json({ error: "Failed to create guest" });
  }
};

/**
 * Update guest
 */
export const updateGuest = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, middle_name, last_name, gender, ethnicity, email, phone_number } = req.body;

    const [result] = await db.query(
      "CALL UpdateGuest(?, ?, ?, ?, ?, ?, ?, ?)",
      [id, first_name, middle_name, last_name, gender, ethnicity, email, phone_number]
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: "Guest not found" });
    }

    res.json(result[0][0]);
  } catch (error) {
    console.error("Error updating guest:", error);
    res.status(500).json({ error: "Failed to update guest" });
  }
};

/**
 * Delete guest
 */
export const deleteGuest = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("CALL DeleteGuest(?)", [id]);

    res.json({ message: "Guest deleted successfully" });
  } catch (error) {
    console.error("Error deleting guest:", error);

    // Check if error is due to foreign key constraint
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: "Cannot delete guest with existing bookings" });
    }

    res.status(500).json({ error: "Failed to delete guest" });
  }
};

/**
 * Find or create guest
 * Used for walk-in bookings - finds existing guest or creates new one
 */
export const findOrCreateGuest = async (req, res) => {
  try {
    const { first_name, middle_name, last_name, gender, ethnicity, email, phone_number } = req.body;

    // Validation
    if (!first_name || !last_name) {
      return res.status(400).json({ error: "First name and last name are required" });
    }

    const guestId = uuidv4();

    const [result] = await db.query(
      "CALL FindOrCreateGuest(?, ?, ?, ?, ?, ?, ?, ?)",
      [guestId, first_name, middle_name || null, last_name, gender || null, ethnicity || null, email || null, phone_number || null]
    );

    res.json(result[0][0]);
  } catch (error) {
    console.error("Error finding/creating guest:", error);
    res.status(500).json({ error: "Failed to process guest" });
  }
};
