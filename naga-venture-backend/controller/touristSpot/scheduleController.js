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

export const upsertTouristSpotSchedules = async (req, res) => {
  try {
    const { id } = req.params;
    const schedules = req.body.schedules;
    if (!Array.isArray(schedules)) {
      return res.status(400).json({ success: false, message: "schedules must be an array" });
    }

    // Remove all existing schedules for this spot
    await db.query("DELETE FROM tourist_spot_schedules WHERE tourist_spot_id = ?", [id]);

    // Insert new schedules
    for (const sched of schedules) {
      await db.query(
        `INSERT INTO tourist_spot_schedules (id, tourist_spot_id, day_of_week, open_time, close_time, is_closed) VALUES (UUID(), ?, ?, ?, ?, ?)`,
        [id, sched.day_of_week, sched.open_time || null, sched.close_time || null, !!sched.is_closed]
      );
    }
    res.json({ success: true, message: "Schedules updated successfully!" });
  } catch (error) {
    return handleDbError(error, res);
  }
};
