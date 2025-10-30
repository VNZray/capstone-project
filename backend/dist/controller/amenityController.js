import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

export async function getAmenities(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM amenity ORDER BY name ASC");
    response.json(data);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return handleDbError(error, response);
  }
}

// get data by ID
export async function getAmenityById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM amenity WHERE id = ?", [id]);
    if (!data || data.length === 0) {
      return response.status(404).json({ message: "Amenity not found" });
    }
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching Amenity by ID:", error);
    return handleDbError(error, response);
  }
}

// insert into table
export async function insertData(request, response) {
  try {
    const { name } = request.body;

    await db.query(`INSERT INTO amenity (name) VALUES (?)`, [name]);

    return response
      .status(201)
      .json({ message: "Amenity inserted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}

// delete data by ID
export async function deleteData(request, response) {
  const { id } = request.params;
  try {
    const [result] = await db.query("DELETE FROM amenity WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Amenity not found" });
    }
    response.json({ message: "Amenity deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}
// update data by ID
export async function updateData(request, response) {
  const { id } = request.params;
  try {
    const { name } = request.body;
    const [result] = await db.query(
      "UPDATE amenity SET name = ? WHERE id = ?",
      [name, id]
    );
    if (result.affectedRows === 0) {
      return response.status(404).json({ message: "Amenity not found" });
    }
    response.json({ message: "Amenity updated successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}
