import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

export const submitEditRequest = async (req, res) => {
  let conn;
  try {
    const { id } = req.params;
    const {
      name, description, province_id, municipality_id, barangay_id,
      latitude, longitude, contact_phone, contact_email, website,
      entry_fee, category_ids, type_id,
      spot_status, is_featured,
      categories_only = false // Flag to indicate if only categories changed
    } = req.body;

    if (
      !name || !description || !province_id || !municipality_id ||
      !barangay_id || !contact_phone || !type_id ||
      !Array.isArray(category_ids) || category_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check existence and validity in parallel
    const placeholders = category_ids.map(() => '?').join(',');
    const [
      [spot], [categories], [type], [prov], [mun], [bar]
    ] = await Promise.all([
      db.execute("SELECT id, spot_status FROM tourist_spots WHERE id = ?", [id]),
      db.execute(`SELECT id FROM category WHERE id IN (${placeholders}) AND type_id = ?`, [...category_ids, type_id]),
      db.execute("SELECT id FROM type WHERE id = ?", [type_id]),
      db.execute("SELECT id FROM province WHERE id = ?", [province_id]),
      db.execute("SELECT id FROM municipality WHERE id = ? AND province_id = ?", [municipality_id, province_id]),
      db.execute("SELECT id FROM barangay WHERE id = ? AND municipality_id = ?", [barangay_id, municipality_id]),
    ]);

    if (!spot.length) return res.status(404).json({ success: false, message: "Tourist spot not found" });
    if (categories.length !== category_ids.length) return res.status(400).json({ success: false, message: "One or more invalid category_ids or categories don't match the type" });
    if (!type.length) return res.status(400).json({ success: false, message: "Invalid type_id" });
    if (!prov.length) return res.status(400).json({ success: false, message: "Invalid province_id" });
    if (!mun.length) return res.status(400).json({ success: false, message: "Invalid municipality_id for the selected province" });
    if (!bar.length) return res.status(400).json({ success: false, message: "Invalid barangay_id for the selected municipality" });

    // If only categories changed, apply the change directly without approval
    if (categories_only) {
      // Start transaction
      conn = await db.getConnection();
      await conn.beginTransaction();

      // Update categories directly
      await conn.execute(
        "DELETE FROM tourist_spot_categories WHERE tourist_spot_id = ?",
        [id]
      );

      // Insert new categories
      const categoryValues = [];
      const categoryPlaceholders = [];
      category_ids.forEach(categoryId => {
        categoryPlaceholders.push("(UUID(), ?, ?)");
        categoryValues.push(id, categoryId);
      });

      await conn.execute(
        `INSERT INTO tourist_spot_categories (id, tourist_spot_id, category_id) 
         VALUES ${categoryPlaceholders.join(",")}`,
        categoryValues
      );

      // Update the tourist spot's updated_at timestamp
      await conn.execute(
        "UPDATE tourist_spots SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id]
      );

      await conn.commit();

      return res.json({
        success: true,
        message: "Categories updated successfully",
      });
    }

    // Check for pending edit request for non-category-only changes
    const [pending] = await db.execute(
      "SELECT id FROM tourist_spot_edits WHERE tourist_spot_id = ? AND approval_status = 'pending'",
      [id]
    );
    if (pending.length)
      return res.status(400).json({
        success: false,
        message: "There is already a pending edit request for this tourist spot.",
      });

    // Start transaction for full edit request
    conn = await db.getConnection();
    await conn.beginTransaction();

    const currentStatus = Array.isArray(spot) && spot[0] && spot[0].spot_status ? spot[0].spot_status : null;
    const statusToSave = typeof spot_status !== 'undefined' && spot_status !== null ? spot_status : currentStatus;
    const featuredToSave = typeof is_featured !== 'undefined' && is_featured !== null ? is_featured : 0;

    // Generate UUID for the edit
    const [[{ id: editId }]] = await conn.execute("SELECT UUID() AS id");

    await conn.execute(
      `INSERT INTO tourist_spot_edits (
        id, tourist_spot_id, name, description, province_id, municipality_id, barangay_id,
        latitude, longitude, contact_phone, contact_email, website, entry_fee,
        spot_status, is_featured, type_id, approval_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        editId, id, name, description, province_id, municipality_id, barangay_id,
        latitude ?? null, longitude ?? null, contact_phone, contact_email ?? null,
        website ?? null, entry_fee ?? null,
        statusToSave, featuredToSave, type_id,
      ]
    );

    await conn.commit();

    res.json({
      success: true,
      message: "Edit request submitted successfully and is pending admin approval",
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    return handleDbError(error, res);
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
