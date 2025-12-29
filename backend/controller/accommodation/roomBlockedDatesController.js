import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";

const BLOCKED_DATE_FIELDS = [
  "room_id",
  "business_id",
  "start_date",
  "end_date",
  "block_reason",
  "notes",
  "created_by",
];

const makePlaceholders = (n) => Array(n).fill("?").join(", ");

const buildBlockedDateParams = (id, body) => [
  id,
  ...BLOCKED_DATE_FIELDS.map((f) => body?.[f] ?? null),
];

/**
 * Get all room blocked dates
 */
export async function getAllBlockedDates(req, res) {
  try {
    const [rows] = await db.query("CALL GetAllRoomBlockedDates()");
    res.json(rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Get blocked date by ID
 */
export async function getBlockedDateById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query("CALL GetRoomBlockedDateById(?)", [id]);
    if (!rows[0] || rows[0].length === 0) {
      return res.status(404).json({ message: "Blocked date not found" });
    }
    res.json(rows[0][0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Get blocked dates by room ID
 */
export async function getBlockedDatesByRoomId(req, res) {
  try {
    const { room_id } = req.params;
    const [rows] = await db.query("CALL GetBlockedDatesByRoomId(?)", [room_id]);
    res.json(rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Get blocked dates by business ID
 */
export async function getBlockedDatesByBusinessId(req, res) {
  try {
    const { business_id } = req.params;
    const [rows] = await db.query("CALL GetBlockedDatesByBusinessId(?)", [business_id]);
    res.json(rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Get blocked dates within a date range for a room
 */
export async function getBlockedDatesInRange(req, res) {
  try {
    const { room_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date and end_date are required" });
    }

    const [rows] = await db.query("CALL GetBlockedDatesInRange(?, ?, ?)", [
      room_id,
      start_date,
      end_date,
    ]);
    res.json(rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Check room availability for a date range
 */
export async function checkRoomAvailability(req, res) {
  try {
    const { room_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date and end_date are required" });
    }

    const [rows] = await db.query("CALL CheckRoomAvailability(?, ?, ?)", [
      room_id,
      start_date,
      end_date,
    ]);

    const status = rows[0]?.[0]?.availability_status || "AVAILABLE";
    res.json({
      room_id,
      start_date,
      end_date,
      available: status === "AVAILABLE",
      status,
    });
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Insert (create) a blocked date range
 */
export async function insertBlockedDate(req, res) {
  try {
    const {
      room_id,
      business_id,
      start_date,
      end_date,
      block_reason = "Other",
      notes,
    } = req.body;

    // Validation
    const missing = [];
    if (!room_id) missing.push("room_id");
    if (!business_id) missing.push("business_id");
    if (!start_date) missing.push("start_date");
    if (!end_date) missing.push("end_date");

    if (missing.length) {
      return res.status(400).json({ error: "Missing required fields", fields: missing });
    }

    // Check for date conflicts
    const [conflictCheck] = await db.query("CALL CheckRoomAvailability(?, ?, ?)", [
      room_id,
      start_date,
      end_date,
    ]);

    const conflictStatus = conflictCheck[0]?.[0]?.availability_status;
    if (conflictStatus === "BOOKING_CONFLICT") {
      return res.status(409).json({
        error: "Date range conflicts with existing booking",
        status: conflictStatus,
      });
    }
    if (conflictStatus === "BLOCKED") {
      return res.status(409).json({
        error: "Date range conflicts with existing block",
        status: conflictStatus,
      });
    }

    const id = uuidv4();
    const created_by = req.user?.id || null;

    const params = buildBlockedDateParams(id, {
      room_id,
      business_id,
      start_date,
      end_date,
      block_reason,
      notes,
      created_by,
    });
    const placeholders = makePlaceholders(params.length);
    const [rows] = await db.query(`CALL InsertRoomBlockedDate(${placeholders})`, params);

    res.status(201).json(rows[0][0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Update a blocked date range
 */
export async function updateBlockedDate(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "id parameter is required" });
    }

    // Check if exists
    const [existing] = await db.query("CALL GetRoomBlockedDateById(?)", [id]);
    if (!existing[0] || existing[0].length === 0) {
      return res.status(404).json({ message: "Blocked date not found" });
    }

    const params = buildBlockedDateParams(id, req.body);
    const placeholders = makePlaceholders(params.length);
    const [rows] = await db.query(`CALL UpdateRoomBlockedDate(${placeholders})`, params);

    res.json(rows[0][0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Delete a blocked date range
 */
export async function deleteBlockedDate(req, res) {
  try {
    const { id } = req.params;

    // Check if exists
    const [existing] = await db.query("CALL GetRoomBlockedDateById(?)", [id]);
    if (!existing[0] || existing[0].length === 0) {
      return res.status(404).json({ message: "Blocked date not found" });
    }

    await db.query("CALL DeleteRoomBlockedDate(?)", [id]);
    res.status(204).send();
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Bulk block dates for multiple rooms
 */
export async function bulkBlockDates(req, res) {
  try {
    const { room_ids, business_id, start_date, end_date, block_reason = "Other", notes } = req.body;

    if (!Array.isArray(room_ids) || room_ids.length === 0) {
      return res.status(400).json({ error: "room_ids array is required" });
    }
    if (!business_id || !start_date || !end_date) {
      return res.status(400).json({ error: "business_id, start_date, and end_date are required" });
    }

    const created_by = req.user?.id || null;
    const results = [];
    const errors = [];

    for (const room_id of room_ids) {
      try {
        // Check availability
        const [conflictCheck] = await db.query("CALL CheckRoomAvailability(?, ?, ?)", [
          room_id,
          start_date,
          end_date,
        ]);
        const conflictStatus = conflictCheck[0]?.[0]?.availability_status;

        if (conflictStatus !== "AVAILABLE") {
          errors.push({ room_id, error: `Conflict: ${conflictStatus}` });
          continue;
        }

        const id = uuidv4();
        const params = buildBlockedDateParams(id, {
          room_id,
          business_id,
          start_date,
          end_date,
          block_reason,
          notes,
          created_by,
        });
        const placeholders = makePlaceholders(params.length);
        const [rows] = await db.query(`CALL InsertRoomBlockedDate(${placeholders})`, params);
        results.push(rows[0][0]);
      } catch (err) {
        errors.push({ room_id, error: err.message });
      }
    }

    res.status(201).json({
      created: results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: room_ids.length,
        success: results.length,
        failed: errors.length,
      },
    });
  } catch (err) {
    handleDbError(err, res);
  }
}
