import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Get all tourists
export async function getAllTourists(request, response) {
  try {
    const [data] = await db.query("CALL GetAllTourists()");
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Get tourist by ID
export async function getTouristById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetTouristById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "Tourist not found" });
    }
    response.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Create new tourist
export async function createTourist(request, response) {
  try {
    const id = uuidv4();
    const params = [
      id,
      request.body.first_name ?? null,
      request.body.middle_name ?? null,
      request.body.last_name ?? null,
      request.body.ethnicity ?? null,
      request.body.birthday ?? null,
      request.body.age ?? null,
      request.body.gender ?? null,
      request.body.nationality ?? null,
      request.body.category ?? null,
      request.body.phone_number ?? null,
      request.body.email ?? null,
      request.body.address_id ?? null,
    ];
    const [data] = await db.query("CALL InsertTourist(?,?,?,?,?,?,?,?,?,?,?,?,?)", params);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ error: "Inserted row not found" });
    }
    response.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// delete tourist by ID
export async function deleteTourist(request, response) {
  const { id } = request.params;
  try {
    await db.query("CALL DeleteTourist(?)", [id]);
    // Check if tourist still exists
    const [check] = await db.query("CALL GetTouristById(?)", [id]);
    if (check[0] && check[0].length > 0) {
      return response.status(404).json({ message: "Tourist not deleted" });
    }
    response.json({ message: "Tourist deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Update tourist by ID
export async function updateTourist(request, response) {
  const { id } = request.params;
  try {
    const params = [
      id,
      request.body.first_name ?? null,
      request.body.middle_name ?? null,
      request.body.last_name ?? null,
      request.body.ethnicity ?? null,
      request.body.birthday ?? null,
      request.body.age ?? null,
      request.body.gender ?? null,
      request.body.nationality ?? null,
      request.body.category ?? null,
      request.body.phone_number ?? null,
      request.body.email ?? null,
      request.body.address_id ?? null,
    ];
    const [data] = await db.query("CALL UpdateTourist(?,?,?,?,?,?,?,?,?,?,?,?,?)", params);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "Tourist not found" });
    }
    response.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}
