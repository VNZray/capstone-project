import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// Get all external bookings
export async function getAllExternalBooking(request, response) {
  try {
    const [data] = await db.query("CALL GetAllExternalBookings()");
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Get external bookings by business ID
export const getAllExternalBookingByBusinessId = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetExternalBookingsByBusinessId(?)", [
      id,
    ]);
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Get external booking by ID
export async function getExternalBookingById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetExternalBookingById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return response
        .status(404)
        .json({ message: "External Booking not found" });
    }
    response.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Insert external booking
export async function insertExternalBooking(request, response) {
  try {
    const { name, link, business_id } = request.body;
    const [data] = await db.query(
      "CALL InsertExternalBooking(?, ?, ?)",
      [name ?? null, link ?? null, business_id ?? null]
    );
    response.status(201).json({
      message: "External Booking created successfully",
      id: data[0][0].id,
    });
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Update external booking by ID
export async function updateExternalBooking(request, response) {
  const { id } = request.params;
  const { name, link, business_id } = request.body;
  try {
    const [data] = await db.query(
      "CALL UpdateExternalBooking(?, ?, ?, ?)",
      [id, name ?? null, link ?? null, business_id ?? null]
    );
    if (!data[0] || data[0].length === 0) {
      return response
        .status(404)
        .json({ message: "External Booking not found" });
    }
    response.json({
      message: "External Booking updated successfully",
      ...data[0][0],
    });
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Delete external booking by ID
export async function deleteExternalBooking(request, response) {
  const { id } = request.params;
  try {
    await db.query("CALL DeleteExternalBooking(?)", [id]);
    response.json({ message: "External Booking deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}
