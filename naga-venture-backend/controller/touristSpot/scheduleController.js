import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// Get schedules for a tourist spot
export const getTouristSpotSchedules = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT * FROM tourist_spot_schedules WHERE tourist_spot_id = ? ORDER BY day_of_week ASC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    return handleDbError(error, res);
  }
};

// Replace schedules for a tourist spot
export const upsertTouristSpotSchedules = async (req, res) => {
  const { id } = req.params;
  const { schedules } = req.body;
  if (!Array.isArray(schedules)) {
    return res.status(400).json({ success: false, message: "'schedules' must be an array" });
  }
  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.execute("DELETE FROM tourist_spot_schedules WHERE tourist_spot_id = ?", [id]);

    if (schedules.length) {
      const values = [];
      const placeholders = [];
      schedules.forEach((s) => {
        const day = Number(s.day_of_week);
        const isClosed = !!s.is_closed;
        const open = isClosed ? null : (s.open_time ?? null);
        const close = isClosed ? null : (s.close_time ?? null);
        if (!Number.isNaN(day) && day >= 0 && day <= 6) {
          placeholders.push("(UUID(), ?, ?, ?, ?, ?)");
          values.push(id, day, open, close, isClosed ? 1 : 0);
        }
      });
      if (placeholders.length) {
        await conn.execute(
          `INSERT INTO tourist_spot_schedules (id, tourist_spot_id, day_of_week, open_time, close_time, is_closed)
           VALUES ${placeholders.join(",")}`,
          values
        );
      }
    }

    await conn.commit();
    res.json({ success: true, message: "Schedules saved" });
  } catch (error) {
    if (conn) await conn.rollback();
    return handleDbError(error, res);
  } finally {
    if (conn) conn.release();
  }
};
