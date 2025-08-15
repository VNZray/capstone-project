import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

// Get all tourists
export async function getAllTourists(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM tourist");
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Get tourist by ID
export async function getTouristById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM tourist WHERE id = ?", [id]);
    if (data.length === 0) {
      return response.status(404).json({ message: "Tourist not found" });
    }
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Create new tourist
export async function createTourist(request, response) {
  try {
    const id = uuidv4(); // Generate UUID for id if using UUID PK

    const fields = [
      "id",
      "first_name",
      "middle_name",
      "last_name",
      "ethnicity",
      "birthday",
      "age",
      "gender",
      "nationality",
      "category",
      "phone_number",
      "email",
      "province_id",
      "municipality_id",
      "barangay_id",
    ];

    const values = [id, ...fields.slice(1).map((f) => request.body[f] ?? null)];

    // Insert into DB
    await db.query(
      `INSERT INTO tourist (${fields.join(", ")})
       VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    // Fetch data record
    const [data] = await db.query("SELECT * FROM tourist WHERE id = ?", [id]);

    if (data.length === 0) {
      return response.status(404).json({ error: "Inserted row not found" });
    }

    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}
