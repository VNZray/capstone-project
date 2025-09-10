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

    // Validation via procedures (replaces inline SELECTs)
    const csv = category_ids.join(',');
    const [[spotCountRes]] = await db.query("CALL CheckTouristSpotExists(?)", [id]);
    if (!spotCountRes[0] || spotCountRes[0].cnt === 0) {
      return res.status(404).json({ success: false, message: "Tourist spot not found" });
    }
    const [[catForTypeRes]] = await db.query("CALL ValidateCategoriesForType(?,?)", [type_id, csv]);
    if ((catForTypeRes[0]?.matched_count ?? 0) !== category_ids.length) {
      return res.status(400).json({ success: false, message: "One or more invalid category_ids or categories don't match the type" });
    }
    const [[typeCountRes]] = await db.query("CALL CheckTypeExists(?)", [type_id]);
    if ((typeCountRes[0]?.cnt ?? 0) === 0) {
      return res.status(400).json({ success: false, message: "Invalid type_id" });
    }
    const [[provCountRes]] = await db.query("CALL CheckProvinceExists(?)", [province_id]);
    if ((provCountRes[0]?.cnt ?? 0) === 0) {
      return res.status(400).json({ success: false, message: "Invalid province_id" });
    }
    const [[munValidRes]] = await db.query("CALL ValidateMunicipalityInProvince(?,?)", [municipality_id, province_id]);
    if ((munValidRes[0]?.cnt ?? 0) === 0) {
      return res.status(400).json({ success: false, message: "Invalid municipality_id for the selected province" });
    }
    const [[barValidRes]] = await db.query("CALL ValidateBarangayInMunicipality(?,?)", [barangay_id, municipality_id]);
    if ((barValidRes[0]?.cnt ?? 0) === 0) {
      return res.status(400).json({ success: false, message: "Invalid barangay_id for the selected municipality" });
    }

    // If only categories changed, apply the change directly without approval
    if (categories_only) {
      // Start transaction
      conn = await db.getConnection();
      await conn.beginTransaction();

      // Update categories directly via procedures
      await conn.query("CALL DeleteCategoriesByTouristSpot(?)", [id]);
      for (let i = 0; i < category_ids.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await conn.query("CALL InsertTouristSpotCategory(?, ?)", [id, category_ids[i]]);
      }
      // Update timestamp via helper proc
      await conn.query("CALL UpdateTouristSpotTimestamp(?)", [id]);

      await conn.commit();

      return res.json({
        success: true,
        message: "Categories updated successfully",
      });
    }

    // Check for pending edit request for non-category-only changes
  const [[pendingRes]] = await db.query("CALL HasPendingEditRequest(?)", [id]);
  const hasPending = (pendingRes[0]?.pending_count ?? 0) > 0;
  if (hasPending)
      return res.status(400).json({
        success: false,
        message: "There is already a pending edit request for this tourist spot.",
      });


    // Insert into address table and get address_id
    const [addressResult] = await db.query(
      "INSERT INTO address (province_id, municipality_id, barangay_id) VALUES (?, ?, ?)",
      [province_id, municipality_id, barangay_id]
    );
    const address_id = addressResult.insertId;

    // Use provided status or default to pending for edit request record
    const statusToSave = typeof spot_status !== 'undefined' && spot_status !== null ? spot_status : 'pending';
    const featuredToSave = typeof is_featured !== 'undefined' && is_featured !== null ? is_featured : 0;
    const [submitRes] = await db.query("CALL SubmitTouristSpotEditRequest(?,?,?,?,?,?,?,?,?,?,?,?,?)", [
      id,
      name,
      description,
      address_id,
      latitude ?? null,
      longitude ?? null,
      contact_phone,
      contact_email ?? null,
      website ?? null,
      entry_fee ?? null,
      statusToSave,
      featuredToSave,
      type_id,
    ]);

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
