import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";

const ROOM_FIELDS = [
  "business_id",
  "room_number",
  "room_type",
  "description",
  "room_price",
  "per_hour_rate",
  "room_image",
  "status",
  "capacity",
  "floor",
  "room_size",
];

const makePlaceholders = (n) => Array(n).fill("?").join(",");
const buildRoomParams = (id, body) => [
  id,
  ...ROOM_FIELDS.map((f) => body?.[f] ?? null),
];

// fetch all data
export async function getAllRoom(request, response) {
  try {
    const [data] = await db.query("CALL GetAllRooms()");
    response.json(data[0]);
  } catch (error) {
    handleDbError(error, response);
  }
}

// fetch data by ID
export async function getRoomById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetRoomById(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "Room not found" });
    }
    response.json(data[0][0]);
  } catch (error) {
    handleDbError(error, response);
  }
}

// get data by foreign ID
export const getRoomByBusinessId = async (request, response) => {
  // ID comes from route param: GET /api/room/:id
  const id = request.params.id ?? request.query.id;
  if (!id) {
    return response.status(400).json({ message: "business_id (id) is required" });
  }
  try {
    const [data] = await db.query("CALL GetRoomByBusinessId(?)", [id]);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ message: "No rooms found for this business" });
    }
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
};

// insert into table
export async function insertRoom(request, response) {
  try {
    const id = uuidv4();
    const params = buildRoomParams(id, request.body);
    const placeholders = makePlaceholders(params.length);
    const [data] = await db.query(`CALL InsertRoom(${placeholders})`, params);
    if (!data[0] || data[0].length === 0) {
      return response.status(404).json({ error: "Inserted row not found" });
    }
    response.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// update data by ID
export async function updateRoom(request, response) {
  const { id } = request.params;
  try {
    // Check if the room exists
    const [existing] = await db.query("CALL GetRoomById(?)", [id]);
    if (!existing[0] || existing[0].length === 0) {
      return response.status(404).json({ message: "Room not found" });
    }
    const params = [
      ...buildRoomParams(id, request.body),
    ];
    const placeholders = makePlaceholders(params.length);
    const [data] = await db.query(`CALL UpdateRoom(${placeholders})`, params);
    if (!data[0] || data[0].length === 0) {
      return response
        .status(404)
        .json({ message: "Room not found after update" });
    }
    response.json({
      message: "Room updated successfully",
      ...data[0][0],
    });
  } catch (error) {
    handleDbError(error, response);
  }
}

// Delete room
export async function deleteRoom(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL DeleteRoom(?)", [id]);
    if (data.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json({ message: "Room deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}
