import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// Get schedules for a tourist spot
export const getTouristSpotSchedules = async (req, res) => {
  try {
    const { id } = req.params;
  const [data] = await db.query("CALL GetTouristSpotSchedules(?)", [id]);
  const rows = data[0] || [];
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

  await conn.query("CALL DeleteSchedulesByTouristSpot(?)", [id]);

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
        for (let i = 0; i < schedules.length; i++) {
          const s = schedules[i];
          const day = Number(s.day_of_week);
          const isClosed = !!s.is_closed;
          const open = isClosed ? null : (s.open_time ?? null);
          const close = isClosed ? null : (s.close_time ?? null);
          if (!Number.isNaN(day) && day >= 0 && day <= 6) {
            // eslint-disable-next-line no-await-in-loop
            await conn.query("CALL InsertTouristSpotSchedule(?,?,?,?,?)", [id, day, open, close, isClosed ? 1 : 0]);
          }
        }
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
