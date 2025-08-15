import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// Insert Owner Data
export const insertOwner = async (request, response) => {
  try {
    const { first_name, last_name, email, phone_number, business_type } =
      request.body;

    // Insert new owner
    await db.query(
      `INSERT INTO owner (first_name, last_name, email, phone_number, business_type) 
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone_number, business_type]
    );

    // Fetch the owner row to get the UUID
    const [data] = await db.query(
      `SELECT * FROM owner WHERE email = ? LIMIT 1`,
      [email]
    );

    if (data.length === 0) {
      return response.status(500).json({
        status: "error",
        message: "Owner creation failed - not found after insert",
      });
    }

    const owner = data[0];

    response.status(201).json({
      status: "success",
      data: { owner },
    });
  } catch (error) {
    console.error("Error inserting owner:", error);
    return handleDbError(error, response);
  }
};

// Get owner by ID
export async function getOwnerById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM owner WHERE id = ?", [id]);
    if (data.length === 0) {
      return response.status(404).json({ message: "Owner not found" });
    }
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get all owners
export async function getAllOwners(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM owner");
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

export async function updateOwnerById(request, response) {
  const { id } = request.params;
  const allowedFields = [
    "first_name",
    "middle_name",
    "last_name",
    "age",
    "birthday",
    "gender",
    "email",
    "phone_number",
    "business_type",
    "province_id",
    "municipality_id",
    "barangay_id",
  ];

  // Filter only provided fields
  const fieldsToUpdate = Object.keys(request.body).filter((key) =>
    allowedFields.includes(key)
  );

  if (fieldsToUpdate.length === 0) {
    return response
      .status(400)
      .json({ error: "No valid fields provided for update" });
  }

  const values = fieldsToUpdate.map((field) => request.body[field]);
  const setClause = fieldsToUpdate.map((field) => `${field} = ?`).join(", ");

  try {
    const [data] = await db.query(
      `UPDATE owner SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    if (data.affectedRows === 0) {
      return response.status(404).json({ message: "Owner not found" });
    }

    response.json({ message: "Owner updated successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}
