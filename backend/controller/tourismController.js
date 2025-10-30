import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Single source of truth for tourism fields (excluding id)
const TOURISM_FIELDS = [
  "first_name",
  "middle_name",
  "last_name",
  "position",
  "user_id",
];

const makePlaceholders = (n) => Array(n).fill("?").join(",");
const buildTourismParams = (id, body) => [
  id,
  ...TOURISM_FIELDS.map((f) => body?.[f] ?? null),
];

// Get all tourism
export async function getAllTourism(request, response) {
  try {
    const [data] = await db.query("CALL GetAllTourism()");
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Get tourist by ID
export async function getTourismById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetTourismById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "Tourism not found" });
    }
    response.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Create new tourism
export async function createTourism(request, response) {
  try {
    const id = uuidv4();
    const params = buildTourismParams(id, request.body);
    const placeholders = makePlaceholders(params.length);
    const [data] = await db.query(`CALL InsertTourism(${placeholders})`, params);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ error: "Inserted row not found" });
    }
    response.status(201).json(data[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Update tourism
export async function updateTourism(request, response) {
  const { id } = request.params;
  try {
    const params = buildTourismParams(id, request.body);
    const placeholders = makePlaceholders(params.length);
    const [data] = await db.query(`CALL UpdateTourism(${placeholders})`, params);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "Tourism not found" });
    }
    response.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Delete tourism
export async function deleteTourism(request, response) {
  const { id } = request.params;
  try {
    await db.query("CALL DeleteTourism(?)", [id]);
    // confirm deletion
    const [check] = await db.query("CALL GetTourismById(?)", [id]);
    if (check[0] && check[0].length > 0) {
      return response.status(404).json({ message: "Tourism not deleted" });
    }
    response.json({ message: "Tourism deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get tourism by user ID (calls GetTourismByUserId SP)
export async function getTourismByUserId(request, response) {
  const { user_id } = request.params;
  try {
    const [rows] = await db.query("CALL GetTourismByUserId(?)", [user_id]);

    if (!rows[0] || rows[0].length === 0) {
      return response
        .status(404)
        .json({ success: false, message: "Tourism not found" });
    }

    return response.json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}