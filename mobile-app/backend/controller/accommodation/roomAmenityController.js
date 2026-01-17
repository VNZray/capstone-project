import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";

// fetch all data
export async function getAllData(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM room_amenities");
    response.json(data);
  } catch (error) {
    handleDbError(error, response);
  }
}

export async function getRoomAmenities(request, response) {
  try {
    const [data] = await db.query(`
      SELECT amenity.name
      FROM amenity
      JOIN amenity ON room_amenities.amenity_id = amenity.id
      ORDER BY amenity.name ASC
    `);
    response.json(data);
  } catch (error) {
    console.error("Error fetching room amenities:", error);
    return handleDbError(error, response);
  }
}


// fetch data by ID
export async function getDataById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM room_amenities WHERE id = ?", [
      id,
    ]);
    if (data.length === 0) {
      return response.status(404).json({ message: "Data not found" });
    }
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// insert into table
export async function insertData(request, response) {
  try {
    const fields = ["room_id", "amenity_id"];

    // Map fields in order and get values from request.body
    const values = fields.map((f) => request.body[f] ?? null);

    await db.query(
      `INSERT INTO room_amenities (${fields.join(", ")})
       VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    response.status(201).json({ success: true, message: "Room amenity added" });
  } catch (error) {
    return handleDbError(error, response);
  }
}


// update data by ID
export async function updateData(request, response) {
  const { id } = request.params;
  try {
    const fields = ["amenity_id", "room_id"];
    const updates = fields.map((f) => request.body[f] ?? null);

    const [data] = await db.query(
      `UPDATE room_amenities
       SET ${fields.map((f) => `${f} = ?`).join(", ")}
       WHERE id = ?`,
      [...updates, id]
    );

    if (data.affectedRows === 0) {
      return response.status(404).json({ message: "Data not found" });
    }

    const [updated] = await db.query("SELECT * FROM room_amenities WHERE id = ?", [
      id,
    ]);

    response.json(updated);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// delete data by ID
export async function deleteData(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("DELETE FROM room_amenities WHERE id = ?", [id]);

    if (data.affectedRows === 0) {
      return response.status(404).json({ message: "Data not found" });
    }

    response.json({ message: "Row deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}
