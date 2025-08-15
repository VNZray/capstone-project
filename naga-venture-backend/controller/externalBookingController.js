import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// get all provinces
export async function getAllExternalBooking(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM external_booking");
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

export async function insertExternalBooking(request, response) {
  try {
    const fields = ["name", "link", "business_id"];

    const values = fields.map((f) => request.body[f] ?? null); // Ensure null for missing fields

    const [data] = await db.query(
      `INSERT INTO external_booking (
        ${fields.join(", ")}
      ) VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    response.status(201).json({
      message: "External Booking created successfully",
      id: data.insertId,
    });
  } catch (error) {
    console.error("Error inserting business:", error);
    return handleDbError(error, response);
  }
}
