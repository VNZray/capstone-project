import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// Get all businesses
export async function getAllBusiness(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM business");
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// Get business by owner ID
export async function getBusinessByOwnerId(request, response) {
  const { id } = request.params;
  console.log("Owner ID received:", id); // 🛠 debug
  try {
    const [data] = await db.query("SELECT * FROM business WHERE owner_id = ?", [
      id,
    ]);
    console.log("Query data:", data); // 🛠 debug
    if (data.length === 0) {
      return response.status(404).json({ message: "Business not found" });
    }
    response.json(data);
  } catch (error) {
    handleDbError(error, response);
  }
}

export async function getBusinessId(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM business WHERE id = ?", [id]);
    if (data.length === 0) {
      return response.status(404).json({ message: "Business not found" });
    }
    response.json(data[0]);
  } catch (error) {
    handleDbError(error, response);
  }
}

// Insert a new business
export async function insertBusiness(request, response) {
  try {
    // Generate UUID for the new business
    const id = uuidv4();

    const fields = [
      "id", // include the id field
      "business_name",
      "business_type_id",
      "business_category_id",
      "phone_number",
      "email",
      "barangay_id",
      "municipality_id",
      "province_id",
      "description",
      "instagram_url",
      "tiktok_url",
      "facebook_url",
      "latitude",
      "longitude",
      "min_price",
      "max_price",
      "owner_id",
      "status",
      "business_image",
      "hasBooking",
    ];

    const values = [
      id, // first value is the UUID
      ...fields.slice(1).map((f) => request.body[f] ?? null),
    ];

    // Insert with known UUID
    await db.query(
      `INSERT INTO business (${fields.join(", ")})
       VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    // Retrieve the data row by UUID
    const [data] = await db.query("SELECT * FROM business WHERE id = ?", [id]);

    if (data.length === 0) {
      return response
        .status(404)
        .json({ error: "Inserted business not found" });
    }

    response.status(201).json({
      message: "Business created successfully",
      ...data[0],
    });
  } catch (error) {
    handleDbError(error, response);
  }
}

// update business (only update provided fields)
export async function updateBusiness(request, response) {
  const { id } = request.params;

  try {
    // Check if the business exists
    const [existing] = await db.query("SELECT * FROM business WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return response.status(404).json({ message: "Business not found" });
    }

    // Only update fields provided in request.body
    const allowedFields = [
      "business_name",
      "business_type_id",
      "business_category_id",
      "phone_number",
      "email",
      "barangay_id",
      "municipality_id",
      "province_id",
      "description",
      "instagram_url",
      "tiktok_url",
      "facebook_url",
      "latitude",
      "longitude",
      "min_price",
      "max_price",
      "owner_id",
      "status",
      "business_image",
      "hasBooking",
    ];

    // Filter fields to only those present in request.body
    const fieldsToUpdate = allowedFields.filter((field) =>
      Object.prototype.hasOwnProperty.call(request.body, field)
    );

    if (fieldsToUpdate.length === 0) {
      return response.status(400).json({ message: "No valid fields provided for update" });
    }

    const values = fieldsToUpdate.map((f) => request.body[f]);

    await db.query(
      `UPDATE business SET ${fieldsToUpdate.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`,
      [...values, id]
    );

    // Retrieve the updated data
    const [data] = await db.query("SELECT * FROM business WHERE id = ?", [id]);
    response.json({
      message: "Business updated successfully",
      ...data[0],
    });
  } catch (error) {
    handleDbError(error, response);
  }
}

// delete data by ID
export async function deleteBusiness(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("DELETE FROM business WHERE id = ?", [id]);

    if (data.affectedRows === 0) {
      return response.status(404).json({ message: "Data not found" });
    }

    response.json({ message: "Row deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}