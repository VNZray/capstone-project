import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// Get all pending edit requests for tourist spots
export const getPendingEditRequests = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        tse.id,
        tse.tourist_spot_id,
        tse.name,
        tse.description,
        tse.province_id,
        tse.municipality_id,
        tse.barangay_id,
        tse.latitude,
        tse.longitude,
        tse.contact_phone,
        tse.contact_email,
        tse.website,
        tse.entry_fee,
        tse.spot_status,
        tse.is_featured,
        tse.type_id,
        tse.approval_status,
        tse.submitted_at,
        tse.reviewed_at,
        t.type,
        p.province,
        m.municipality,
        b.barangay,
        ts.name as original_name,
        ts.description as original_description,
        ot.type as original_type,
        op.province as original_province,
        om.municipality as original_municipality,
        ob.barangay as original_barangay,
        ts.contact_phone as original_contact_phone,
        ts.website as original_website,
        ts.entry_fee as original_entry_fee,
        ts.spot_status as original_status
      FROM tourist_spot_edits tse
      JOIN type t ON tse.type_id = t.id
      JOIN province p ON tse.province_id = p.id
      JOIN municipality m ON tse.municipality_id = m.id
      JOIN barangay b ON tse.barangay_id = b.id
      JOIN tourist_spots ts ON tse.tourist_spot_id = ts.id
      LEFT JOIN province op ON ts.province_id = op.id
      LEFT JOIN municipality om ON ts.municipality_id = om.id
      LEFT JOIN barangay ob ON ts.barangay_id = ob.id
      LEFT JOIN type ot ON ts.type_id = ot.id
      WHERE tse.approval_status = 'pending'
      ORDER BY tse.submitted_at DESC
    `);

    // Get current categories for each tourist spot (since categories are now managed directly)
    for (let row of rows) {
      // Get current categories
      const [currentCategories] = await db.execute(
        `SELECT c.id, c.category, c.type_id 
         FROM tourist_spot_categories tsc
         JOIN category c ON tsc.category_id = c.id
         WHERE tsc.tourist_spot_id = ? 
         ORDER BY c.category ASC`,
        [row.tourist_spot_id]
      );
      row.current_categories = currentCategories;
    }

    res.json({
      success: true,
      data: rows,
      message: "Pending edit requests retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching pending edit requests:", error);
    return handleDbError(error, res);
  }
};

// Get all pending tourist spots (new submissions)
export const getPendingTouristSpots = async (req, res) => {
  try {
    // Explicitly fetch only pending tourist spots with required joins
    const [rows] = await db.execute(`
      SELECT 
        ts.id, ts.name, ts.description, ts.province_id, ts.municipality_id, ts.barangay_id,
        ts.latitude, ts.longitude, ts.contact_phone, ts.contact_email, ts.website, ts.entry_fee,
        ts.spot_status, ts.is_featured, t.type, ts.type_id,
        ts.created_at, ts.updated_at, p.province, m.municipality, b.barangay
      FROM tourist_spots ts
      JOIN type t ON ts.type_id = t.id
      JOIN province p ON ts.province_id = p.id
      JOIN municipality m ON ts.municipality_id = m.id
      JOIN barangay b ON ts.barangay_id = b.id
      WHERE ts.spot_status = 'pending'
      ORDER BY ts.created_at DESC
    `);

    // Get categories for each tourist spot
    for (let row of rows) {
      const [categories] = await db.execute(
        `SELECT c.id, c.category, c.type_id 
         FROM tourist_spot_categories tsc
         JOIN category c ON tsc.category_id = c.id
         WHERE tsc.tourist_spot_id = ? 
         ORDER BY c.category ASC`,
        [row.id]
      );
      row.categories = categories;
    }

    res.json({
      success: true,
      data: rows,
      message: "Pending tourist spots retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching pending tourist spots:", error);
    return handleDbError(error, res);
  }
};

// Approve a tourist spot (change status from pending to active)
export const approveTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingSpot] = await db.execute(
      "SELECT id, spot_status FROM tourist_spots WHERE id = ?",
      [id]
    );

    if (existingSpot.length === 0) {
      return res.status(404).json({
        success: false,
        message: "tourist_spots not found",
      });
    }

    if (existingSpot[0].spot_status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "tourist_spots is not pending approval",
      });
    }

    // Update status to active
    await db.execute(
      "UPDATE tourist_spots SET spot_status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Tourist spot approved successfully",
    });
    
  } catch (error) {
    console.error("Error approving tourist spot:", error);
    return handleDbError(error, response);
  }
};

// Approve an edit request for tourist spots
export const approveEditRequest = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;

    // Get the edit request
    const [editRequest] = await db.execute(
      "SELECT * FROM tourist_spot_edits WHERE id = ? AND approval_status = 'pending'",
      [id]
    );

    if (editRequest.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Edit request not found or already processed",
      });
    }

    const edit = editRequest[0];

    // Start transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Update the main tourist_spots table with the edited data
    await conn.execute(
      `
      UPDATE tourist_spots SET
        name = ?, description = ?, province_id = ?, municipality_id = ?, barangay_id = ?,
        latitude = ?, longitude = ?, contact_phone = ?, contact_email = ?, website = ?, 
        entry_fee = ?, spot_status = ?, is_featured = ?, type_id = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [
        edit.name,
        edit.description,
        edit.province_id,
        edit.municipality_id,
        edit.barangay_id,
        edit.latitude,
        edit.longitude,
        edit.contact_phone,
        edit.contact_email,
        edit.website,
        edit.entry_fee,
        edit.spot_status,
        edit.is_featured,
        edit.type_id,
        edit.tourist_spot_id,
      ]
    );

    // Mark the edit request as approved
    await conn.execute(
      "UPDATE tourist_spot_edits SET approval_status = 'approved', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Edit request approved and applied successfully",
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    console.error("Error approving edit request:", error);
    return handleDbError(error, res);
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

// Reject an edit request for tourist spots
export const rejectEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log(
      `[approval] rejectEditRequest called for id=${id} reason=${String(
        reason
      )}`
    );

    // Check if edit request exists and is pending
    const [editRequest] = await db.execute(
      "SELECT id FROM tourist_spot_edits WHERE id = ? AND approval_status = 'pending'",
      [id]
    );

    if (editRequest.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Edit request not found or already processed",
      });
    }

    // Mark the edit request as rejected and save remarks
    await db.execute(
      "UPDATE tourist_spot_edits SET approval_status = 'rejected', reviewed_at = CURRENT_TIMESTAMP, remarks = ? WHERE id = ?",
      [reason || "", id]
    );

    // Read back the saved remarks to confirm
    const [updatedRows] = await db.execute(
      "SELECT id, approval_status, remarks, reviewed_at FROM tourist_spot_edits WHERE id = ?",
      [id]
    );

    const updated =
      Array.isArray(updatedRows) && updatedRows.length > 0
        ? updatedRows[0]
        : null;

    res.json({
      success: true,
      message: "Edit request rejected successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error rejecting edit request:", error);
    return handleDbError(error, response);
  }
};

// Reject a tourist spot (change status from pending to rejected)
export const rejectTouristSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if spot exists and is pending
    const [existingSpot] = await db.execute(
      "SELECT id, spot_status FROM tourist_spots WHERE id = ?",
      [id]
    );

    if (existingSpot.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    if (existingSpot[0].spot_status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Tourist spot is not pending approval",
      });
    }

    await db.execute(
      "UPDATE tourist_spots SET spot_status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      message: "Tourist spot rejected successfully",
    });
  } catch (error) {
    console.error("Error rejecting tourist spot:", error);
    return handleDbError(error, res);
  }
};
