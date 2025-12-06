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
      catMap.get(c.tourist_spot_id).push({ id: c.id, category: c.category, parent_category: c.parent_category, level: c.level });
    }
    for (const row of rows) {
      row.current_categories = catMap.get(row.tourist_spot_id) || [];
    }

    try {
      const spotIds = Array.from(new Set(rows.map(r => r.tourist_spot_id).filter(Boolean)));
      const primaryImageBySpot = new Map();
      for (const sid of spotIds) {
        try {
          const [imgSets] = await db.query("CALL GetTouristSpotImages(?)", [sid]);
          const images = imgSets?.[0] || [];
          const primary = images.find(i => i && (i.is_primary === 1 || i.is_primary === true));
          const first = images[0];
          const url = (primary?.file_url) || (first?.file_url) || null;
          primaryImageBySpot.set(sid, url);
        } catch (e) {
          primaryImageBySpot.set(sid, null);
        }
      }
      for (const row of rows) {
        const pid = row.tourist_spot_id;
        row.primary_image = row.primary_image || primaryImageBySpot.get(pid) || null;
      }
    } catch (e) {
    }
    res.json({ success: true, data: rows, message: "Pending edit requests retrieved successfully" });
  } catch (error) {
    console.error("Error fetching pending edit requests:", error);
    return handleDbError(error, res);
  }
};

// Get all pending tourist spots
export const getPendingTouristSpots = async (req, res) => {
  try {
    const [data] = await db.query("CALL GetPendingTouristSpots()");
    const rows = data[0] || [];
    const cats = data[1] || [];
    const scheds = data[2] || [];
    const primaryImages = data[3] || [];
    const primaryImagesMap = new Map();
    for (const img of primaryImages) {
      primaryImagesMap.set(img.tourist_spot_id, img.file_url);
    }
    const catMap = new Map();
    for (const c of cats) {
      if (!catMap.has(c.tourist_spot_id)) catMap.set(c.tourist_spot_id, []);
      catMap.get(c.tourist_spot_id).push({ id: c.id, category: c.category, parent_category: c.parent_category, level: c.level });
    }
    const schedMap = new Map();
    for (const s of scheds) {
      if (!schedMap.has(s.tourist_spot_id)) schedMap.set(s.tourist_spot_id, []);
      schedMap.get(s.tourist_spot_id).push({
        day_of_week: Number(s.day_of_week),
        is_closed: Boolean(s.is_closed),
        open_time: s.open_time,
        close_time: s.close_time,
      });
    }
    for (const row of rows) {
      row.categories = catMap.get(row.id) || [];
      row.schedules = schedMap.get(row.id) || [];
      row.primary_image = primaryImagesMap.get(row.id) || null;
    }
    res.json({ success: true, data: rows, message: "Pending tourist spots retrieved successfully" });
  } catch (error) {
    console.error("Error fetching pending tourist spots:", error);
    return handleDbError(error, res);
  }
};

// Change status from pending to active
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

// Approve an edit request for tourist spots
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

// Reject an edit request for tourist spots
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

// ==================== BUSINESS APPROVAL WORKFLOW ====================

// Get all pending businesses with type & category names for approval dashboard
export const getPendingBusinesses = async (req, res) => {
  try {
    const [data] = await db.query("CALL GetPendingBusinesses()");
    const raw = data[0] || [];
    const rows = raw.map((r) => {
      const row = { ...r };
      // Normalize names for frontend
      row.name = row.name || row.business_name || row.businessName || null;
      row.business_type_name = row.business_type_name || row.type || row.business_type || null;
      row.business_category_name = row.business_category_name || row.category || row.business_category || null;
      return row;
    });
    res.json({ success: true, data: rows, message: 'Pending businesses retrieved successfully' });
  } catch (error) {
    console.error('Error fetching pending businesses:', error);
    return handleDbError(error, res);
  }
};

// Approve a business (set status from Pending -> Active)
export const approveBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("CALL ApproveBusiness(?)", [id]);
    const row = result?.[0];
    const successFlag = row?.success === 1;
    if (!successFlag) {
      try {
        const [checkSets] = await db.query("CALL GetBusinessById(?)", [id]);
        const businessRow = checkSets?.[0]?.[0];
        if (businessRow && String(businessRow.status).toLowerCase() === 'active') {
          return res.json({ success: true, message: 'Business already active' });
        }
      } catch (e) {
      }
      return res.status(400).json({ success: false, message: 'Business not found or not pending' });
    }
    res.json({ success: true, message: 'Business approved successfully' });
  } catch (error) {
    console.error('Error approving business:', error);
    return handleDbError(error, res);
  }
};

// Reject a business (set status from Pending -> Inactive)
export const rejectBusiness = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("CALL RejectBusiness(?)", [id]);
    const row = result?.[0];
    const successFlag = row?.success === 1;
    if (!successFlag) {
      try {
        const [checkSets] = await db.query("CALL GetBusinessById(?)", [id]);
        const businessRow = checkSets?.[0]?.[0];
        if (businessRow && String(businessRow.status).toLowerCase() === 'inactive') {
          return res.json({ success: true, message: 'Business already inactive' });
        }
      } catch (e) {
      }
      return res.status(400).json({ success: false, message: 'Business not found or not pending' });
    }
    res.json({ success: true, message: 'Business rejected successfully' });
  } catch (error) {
    console.error('Error rejecting business:', error);
    return handleDbError(error, res);
  }
};
