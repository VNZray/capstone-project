import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Single source of truth for tourist fields used in SPs (excluding id which is always first)
const TOURIST_FIELDS = [
  "first_name",
  "middle_name",
  "last_name",
  "ethnicity",
  "birthdate",
  "age",
  "gender",
  "nationality",
  "origin",
  "user_id",
];

// Build an array of placeholders like "?, ?, ?"
const makePlaceholders = (n) => Array(n).fill("?").join(",");

// Build params for SP calls: id first, then mapped body fields (null if missing)
const buildTouristParams = (id, body) => [
  id,
  ...TOURIST_FIELDS.map((f) => (body?.[f] ?? null)),
];

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
    const params = buildTouristParams(id, request.body);
    const placeholders = makePlaceholders(params.length);
    const [data] = await db.query(`CALL InsertTourist(${placeholders})`, params);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ error: "Inserted row not found" });
    }
    response.status(201).json(data[0][0]);
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
    const params = buildTouristParams(id, request.body);
    const placeholders = makePlaceholders(params.length);
    const [data] = await db.query(`CALL UpdateTourist(${placeholders})`, params);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "Tourist not found" });
    }
    response.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get tourist by user ID (calls GetTouristByUserId SP)
export async function getTouristByUserId(request, response) {
  const { user_id } = request.params;
  try {
    const [rows] = await db.query("CALL GetTouristByUserId(?)", [user_id]);

    if (!rows[0] || rows[0].length === 0) {
      return response
        .status(404)
        .json({ success: false, message: "Tourist not found" });
    }

    return response.json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}