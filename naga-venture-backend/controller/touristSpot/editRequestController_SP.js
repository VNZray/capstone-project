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
      !barangay_id || !type_id ||
      !Array.isArray(category_ids) || category_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if tourist spot exists using stored procedure
    const [existsResult] = await db.execute(
      'CALL CheckTouristSpotExists(?, @exists, @status)',
      [id]
    );

    const [existsValues] = await db.execute(
      'SELECT @exists as exists_flag, @status as current_status'
    );

    if (!existsValues[0].exists_flag) {
      return res.status(404).json({ 
        success: false, 
        message: "Tourist spot not found" 
      });
    }

    // Validate location IDs using stored procedure
    const [validationResult] = await db.execute(
      'CALL ValidateLocationIds(?, ?, ?, ?, @type_valid, @province_valid, @municipality_valid, @barangay_valid)',
      [type_id, province_id, municipality_id, barangay_id]
    );

    const [validationValues] = await db.execute(
      'SELECT @type_valid as type_valid, @province_valid as province_valid, @municipality_valid as municipality_valid, @barangay_valid as barangay_valid'
    );
    
    const validation = validationValues[0];
    
    if (!validation.type_valid) {
      return res.status(400).json({ success: false, message: "Invalid type_id" });
    }
    if (!validation.province_valid) {
      return res.status(400).json({ success: false, message: "Invalid province_id" });
    }
    if (!validation.municipality_valid) {
      return res.status(400).json({ success: false, message: "Invalid municipality_id for the selected province" });
    }
    if (!validation.barangay_valid) {
      return res.status(400).json({ success: false, message: "Invalid barangay_id for the selected municipality" });
    }

    // Validate categories for type
    const placeholders = category_ids.map(() => '?').join(',');
    const [categories] = await db.execute(
      `SELECT id FROM category WHERE id IN (${placeholders}) AND type_id = ?`, 
      [...category_ids, type_id]
    );

    if (categories.length !== category_ids.length) {
      return res.status(400).json({ 
        success: false, 
        message: "One or more invalid category_ids or categories don't match the type" 
      });
    }

    // If only categories changed, apply the change directly without approval
    if (categories_only) {
      // Start transaction
      conn = await db.getConnection();
      await conn.beginTransaction();

      // Update categories directly using stored procedure
      await conn.execute('CALL UpdateTouristSpotCategoriesOnly(?)', [id]);

      // Insert new categories
      for (const categoryId of category_ids) {
        await conn.execute('CALL AddTouristSpotCategory(?, ?)', [id, categoryId]);
      }

      await conn.commit();

      return res.json({
        success: true,
        message: "Categories updated successfully",
      });
    }

    // Check for pending edit request using stored procedure
    const [pendingResult] = await db.execute(
      'CALL CheckPendingEditRequest(?, @exists, @edit_id)',
      [id]
    );

    const [pendingValues] = await db.execute(
      'SELECT @exists as pending_exists'
    );

    if (pendingValues[0].pending_exists) {
      return res.status(400).json({
        success: false,
        message: "There is already a pending edit request for this tourist spot.",
      });
    }

    // Submit edit request using stored procedure
    const [submitResult] = await db.execute(
      'CALL SubmitEditRequest(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @edit_id)',
      [
        id, name, description, province_id, municipality_id, barangay_id,
        latitude || null, longitude || null, contact_phone || null, contact_email || null,
        website || null, entry_fee || null, type_id, spot_status || 'active', is_featured || false
      ]
    );

    // Get the generated edit ID
    const [editIdResult] = await db.execute('SELECT @edit_id as edit_id');
    const editId = editIdResult[0].edit_id;

    res.json({
      success: true,
      message: "Edit request submitted successfully",
      data: { edit_id: editId },
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
