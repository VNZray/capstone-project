import db from "../db.js";

// get all provinces
export async function getAllExternalBooking(req, res) {
  try {
    const [results] = await db.query("SELECT * FROM external_booking");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function insertExternalBooking(req, res) {
  try {
    const fields = ["name", "link", "business_id"];

    const values = fields.map((f) => req.body[f] ?? null); // Ensure null for missing fields

    const [result] = await db.query(
      `INSERT INTO external_booking (
        ${fields.join(", ")}
      ) VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    res.status(201).json({
      message: "External Booking created successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Error inserting business:", err);
    res.status(500).json({ error: err.message });
  }
}
