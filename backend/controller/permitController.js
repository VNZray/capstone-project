// controllers/permitController.js
import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

const PERMIT_FIELDS = [
  "business_id",
  "permit_type",
  "file_url",
  "file_format",
  "file_size",
  "status",
  "expiration_date",
];

const makePlaceholders = (n) => Array(n).fill("?").join(",");
const buildPermitParams = (id, body) => [
  id,
  ...PERMIT_FIELDS.map((f) => body?.[f] ?? null),
];

// Insert a new permit record into the database using stored procedure
export async function UploadPermit(request, response) {
  try {
    const id = uuidv4();
    const params = buildPermitParams(id, request.body);
    const placeholders = makePlaceholders(params.length);
    const [rows] = await db.query(`CALL InsertPermit(${placeholders})`, params);
    if (!rows[0] || rows[0].length === 0) {
      return response.status(404).json({ error: "Inserted row not found" });
    }
    response.json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Retrieve all permits for a specific business using stored procedure
export async function getPermitByBusinessId(request, response) {
  const { business_id } = request.params;
  try {
    const [data] = await db.query("CALL GetPermitByBusinessId(?)", [business_id]);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "No permits found for this business" });
    }
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Retrieve all permits from the database using stored procedure
export async function getAllPermits(request, response) {
  try {
    const [data] = await db.query("CALL GetAllPermits()");
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Delete a permit by its ID using stored procedure
export async function deletePermit(request, response) {
  const { id } = request.params;
  try {
    await db.query("CALL DeletePermit(?)", [id]);
    // Check if permit still exists
    const [check] = await db.query("CALL GetPermitById(?)", [id]);
    if (check[0] && check[0].length > 0) {
      return response.status(404).json({ message: "Permit not deleted" });
    }
    response.status(204).send();
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Update permit details by ID using stored procedure (all fields optional)
export async function updatePermit(request, response) {
  const { id } = request.params;
  try {
    const params = buildPermitParams(id, request.body);
    const placeholders = makePlaceholders(params.length);
    const [rows] = await db.query(`CALL UpdatePermit(${placeholders})`, params);
    if (!rows[0] || rows[0].length === 0) {
      return response.status(404).json({ message: "Permit not found" });
    }
    response.json(rows[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}
