import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Get all tourism
export async function getAllTourism(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM tourism");
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Get tourist by ID
export async function getTourismById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM tourism WHERE id = ?", [id]);
    if (data.length === 0) {
      return response.status(404).json({ message: "Tourist not found" });
    }
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Create new tourism
export async function createTourism(request, response) {
  try {
    const id = uuidv4(); // Generate unique ID if your tourism table uses UUID

    // List all fields in the same order as the table columns
    const fields = [
      "id",
      "first_name",
      "middle_name",
      "last_name",
      "position",
      "phone_number",
      "email",
    ];

    // Pull values from request body, ensure null if not provided
    const values = [id, ...fields.slice(1).map((f) => request.body[f] ?? null)];

    // Insert query
    await db.query(
      `INSERT INTO tourism (${fields.join(", ")})
       VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    // Fetch inserted row
    const [data] = await db.query("SELECT * FROM tourism WHERE id = ?", [id]);

    if (data.length === 0) {
      return response.status(404).json({ error: "Inserted row not found" });
    }

    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}
