import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// fetch all data
export async function getAllRoom(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM room");
    response.json(data);
  } catch (error) {
    handleDbError(error, response);
  }
}

// fetch all data
export async function getAllRoomByStatus(request, response) {
  const { status } = request.query;
  try {
    const [data] = await db.query("SELECT * FROM room WHERE status = ?", [
      status,
    ]);
    response.json(data);
  } catch (error) {
    handleDbError(error, response);
  }
}

// fetch data by ID
export async function getRoomById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM room WHERE id = ?", [id]);
    if (data.length === 0) {
      return response.status(404).json({ message: "Data not found" });
    }
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get data by foreign ID
export const getRoomByBusinessId = async (request, response) => {
  const { id } = request.query;
  try {
    const [data] = await db.query("SELECT * FROM room WHERE business_id = ?", [
      id,
    ]);
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
};

// get data by foreign ID
export const getRoomByBusinessIdandStatus = async (request, response) => {
  const { id } = request.params;
  const { status } = request.query;
  try {
    const [data] = await db.query(
      "SELECT * FROM room WHERE business_id = ? AND status = ?",
      [id, status]
    );
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
};

// insert into table
export async function insertRoom(request, response) {
  try {
    const id = uuidv4();
    const fields = [
      "id",
      "business_id",
      "room_number",
      "room_type",
      "description",
      "room_price",
      "room_image",
      "status",
      "capacity",
      "floor",
    ];

    const values = [id, ...fields.slice(1).map((f) => request.body[f] ?? null)];

    await db.query(
      `INSERT INTO room (${fields.join(", ")})
       VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    const [data] = await db.query("SELECT * FROM room WHERE id = ?", [id]);

    if (data.length === 0) {
      return response.status(404).json({ error: "Inserted row not found" });
    }

    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// update data by ID
export async function updateRoom(request, response) {
  const { id } = request.params;
  try {
    const fields = [
      "business_id",
      "room_number",
      "room_type",
      "description",
      "room_price",
      "room_image",
      "status",
      "capacity",
      "floor",
    ];
    const updates = fields.map((f) => request.body[f] ?? null);

    const [data] = await db.query(
      `UPDATE room 
       SET ${fields.map((f) => `${f} = ?`).join(", ")}
       WHERE id = ?`,
      [...updates, id]
    );

    if (data.affectedRows === 0) {
      return response.status(404).json({ message: "Data not found" });
    }

    const [updated] = await db.query("SELECT * FROM room WHERE id = ?", [id]);

    response.json(updated);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// delete data by ID
export async function deleteRoom(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("DELETE FROM room WHERE id = ?", [id]);

    if (data.affectedRows === 0) {
      return response.status(404).json({ message: "Data not found" });
    }

    response.json({ message: "Row deleted successfully" });
  } catch (error) {
    return handleDbError(error, response);
  }
}

// join data from two tables
export async function JoinThreeTables(request, response) {
  const { id } = request.params;
  try {
    const query = `
      SELECT table_1.table_1 AS table_1_name, table_2.table_2 AS table_2_name, table_3.table_3 AS table_3_name
      FROM table_3
      INNER JOIN table_2 ON table_3.table_2_id = table_2.id
      INNER JOIN table_1 ON table_2.table_1_id = table_1.id
      WHERE table_3.id = ?
    `;
    const [data] = await db.query(query, [id]);
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}
