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

// insert into table
export async function insertData(request, response) {
  try {
    const { name } = request.body;

    await db.query(
      `INSERT INTO amenity (name) VALUES (?)`,
      [name]
    );

    return response.status(201).json({ message: "Amenity inserted successfully" });

  } catch (error) {
    return handleDbError(error, response);
  }
}

