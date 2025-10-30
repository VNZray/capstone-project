import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// Get all pending edit requests for tourist spots
export const getPendingEditRequests = async (req, res) => {
  try {
    const [data] = await db.query("CALL GetPendingEditRequests()");
    const rows = data[0] || [];
    const cats = data[1] || [];
    const catMap = new Map();
    for (const c of cats) {
      if (!catMap.has(c.tourist_spot_id)) catMap.set(c.tourist_spot_id, []);
      catMap.get(c.tourist_spot_id).push({ id: c.id, category: c.category, type_id: c.type_id });
    }
    for (const row of rows) {
      row.current_categories = catMap.get(row.tourist_spot_id) || [];
    }
    res.json({ success: true, data: rows, message: "Pending edit requests retrieved successfully" });
  } catch (error) {
    console.error("Error fetching pending edit requests:", error);
    return handleDbError(error, res);
  }
};

// Get all pending tourist spots (will be generalized later)
export const getPendingTouristSpots = async (req, res) => {
  try {
    const [data] = await db.query("CALL GetPendingTouristSpots()");
    const rows = data[0] || [];
    const cats = data[1] || [];
    const catMap = new Map();
    for (const c of cats) {
      if (!catMap.has(c.tourist_spot_id)) catMap.set(c.tourist_spot_id, []);
      catMap.get(c.tourist_spot_id).push({ id: c.id, category: c.category, type_id: c.type_id });
    }
    for (const row of rows) {
      row.categories = catMap.get(row.id) || [];
    }
    res.json({ success: true, data: rows, message: "Pending tourist spots retrieved successfully" });
  } catch (error) {
    console.error("Error fetching pending tourist spots:", error);
    return handleDbError(error, res);
  }
};

// Change status from pending to active (will be generalized later)
export const approveTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await db.query("CALL ApproveTouristSpot(?)", [id]);
    const prior = data[0]?.[0];
    let affected = 0;
    if (data[1]?.[0]?.affected_rows !== undefined) {
      affected = data[1][0].affected_rows;
    } else if (Array.isArray(data)) {
      for (const set of data) {
        if (set && set[0] && set[0].affected_rows !== undefined) {
          affected = set[0].affected_rows;
          break;
        }
      }
    }
    if (!prior) return res.status(404).json({ success: false, message: "tourist_spots not found" });
    if (affected === 0) return res.status(400).json({ success: false, message: "tourist_spots is not pending approval" });
    res.json({ success: true, message: "Tourist spot approved successfully" });
  } catch (error) {
    console.error("Error approving tourist spot:", error);
    return handleDbError(error, res);
  }
};

// Reject a tourist spot (change status from pending to rejected)
export const rejectTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await db.query("CALL RejectTouristSpot(?)", [id]);
    const affected = data[0]?.[0]?.affected_rows ?? 0;
    if (affected === 0) return res.status(400).json({ success: false, message: "Tourist spot not found or not pending" });
    res.json({ success: true, message: "Tourist spot rejected successfully" });
  } catch (error) {
    console.error("Error rejecting tourist spot:", error);
    return handleDbError(error, res);
  }
};

// Approve an edit request for tourist spots (will be generalized later)
export const approveEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await db.query("CALL ApproveTouristSpotEdit(?)", [id]);
    const statusRow = data[0]?.[0];
    if (!statusRow) return res.status(404).json({ success: false, message: "Edit request not found or already processed" });
    if (statusRow.status !== 'approved') return res.status(400).json({ success: false, message: "Edit request not approved" });
    res.json({ success: true, message: "Edit request approved and applied successfully" });
  } catch (error) {
    console.error("Error approving edit request:", error);
    return handleDbError(error, res);
  }
};

// Reject an edit request for tourist spots (will be generalized later)
export const rejectEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const [data] = await db.query("CALL RejectTouristSpotEdit(?,?)", [id, reason || ""]);
    const updated = data[0]?.[0] ?? null;
    if (!updated) return res.status(404).json({ success: false, message: "Edit request not found or already processed" });
    res.json({ success: true, message: "Edit request rejected successfully", data: updated });
  } catch (error) {
    console.error("Error rejecting edit request:", error);
    return handleDbError(error, res);
  }
};
