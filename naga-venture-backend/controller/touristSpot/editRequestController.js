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

    // Fetch current spot core + address ids for comparison
    const [spotRows] = await db.query(
      `SELECT ts.id, ts.name AS current_name, ts.description AS current_description, ts.address_id, 
              a.province_id AS current_province_id, a.municipality_id AS current_municipality_id, a.barangay_id AS current_barangay_id,
              ts.latitude AS current_latitude, ts.longitude AS current_longitude, ts.contact_phone AS current_contact_phone,
              ts.contact_email AS current_contact_email, ts.website AS current_website, ts.entry_fee AS current_entry_fee,
              ts.spot_status AS current_status, ts.is_featured AS current_is_featured, ts.type_id AS current_type_id
       FROM tourist_spots ts
       JOIN address a ON ts.address_id = a.id
       WHERE ts.id = ?`,
      [id]
    );
    if (!spotRows.length) {
      return res.status(404).json({ success: false, message: "Tourist spot not found" });
    }
  const current = spotRows[0];

  // Normalize helper (trim + collapse internal whitespace)
  const normalizeText = (val) => (val ?? '').toString().trim().replace(/\s+/g, ' ');
  const normCurrentName = normalizeText(current.current_name);
  const normIncomingName = normalizeText(name);
  const normCurrentDescription = normalizeText(current.current_description);
  const normIncomingDescription = normalizeText(description);

    // Determine which fields have changed
  const nameChanged = normCurrentName !== normIncomingName;
  const descriptionChanged = normCurrentDescription !== normIncomingDescription;
    const addressChanged = (
      current.current_province_id !== Number(province_id) ||
      current.current_municipality_id !== Number(municipality_id) ||
      current.current_barangay_id !== Number(barangay_id)
    );

    // Categories change detection (set comparison)
    const [existingCatRows] = await db.query(
      'SELECT category_id FROM tourist_spot_categories WHERE tourist_spot_id = ?',
      [id]
    );
    const existingCatSet = new Set(existingCatRows.map(r => Number(r.category_id)));
    const submittedCatSet = new Set(category_ids.map(c => Number(c)));
    let categoriesChanged = existingCatSet.size !== submittedCatSet.size;
    if (!categoriesChanged) {
      for (const v of submittedCatSet) {
        if (!existingCatSet.has(v)) { categoriesChanged = true; break; }
      }
    }

    // If explicitly categories_only flag and categories actually changed, update them and exit
    if (categories_only) {
      if (!categoriesChanged) {
        return res.json({ success: true, message: "No category changes detected" });
      }
      conn = await db.getConnection();
      await conn.beginTransaction();
      await conn.query("CALL DeleteCategoriesByTouristSpot(?)", [id]);
      for (let i = 0; i < category_ids.length; i++) { // eslint-disable-line no-plusplus
        // eslint-disable-next-line no-await-in-loop
        await conn.query("CALL InsertTouristSpotCategory(?, ?)", [id, category_ids[i]]);
      }
      await conn.query("CALL UpdateTouristSpotTimestamp(?)", [id]);
      await conn.commit();
      return res.json({ success: true, message: "Categories updated successfully" });
    }

    // Determine if approval is needed (only if name/description/address changed)
    let needsApproval = nameChanged || descriptionChanged || addressChanged;

    // Safety: if none of the approval fields changed after normalization, explicitly prevent approval path
    if (!nameChanged && !descriptionChanged && !addressChanged) {
      needsApproval = false;
    }

    if (process.env.NODE_ENV !== 'production' && process.env.LOG_TOURIST_SPOT_DIFFS === '1') {
      // Lightweight diff logging (no PII beyond provided fields)
      // eslint-disable-next-line no-console
      console.debug('[TouristSpotEditDiff]', {
        id,
        nameChanged,
        descriptionChanged,
        addressChanged,
        categoriesChanged,
        needsApproval,
      });
    }

    // If no approval needed, update allowed fields instantly (including categories if changed)
    if (!needsApproval) {
      conn = await db.getConnection();
      await conn.beginTransaction();

      // Update categories if they changed
      if (categoriesChanged) {
        await conn.query("CALL DeleteCategoriesByTouristSpot(?)", [id]);
        for (let i = 0; i < category_ids.length; i++) { // eslint-disable-line no-plusplus
          // eslint-disable-next-line no-await-in-loop
          await conn.query("CALL InsertTouristSpotCategory(?, ?)", [id, category_ids[i]]);
        }
      }

      // Directly update mutable fields that don't require approval
      await conn.query(
        `UPDATE tourist_spots SET 
            latitude = ?,
            longitude = ?,
            contact_phone = ?,
            contact_email = ?,
            website = ?,
            entry_fee = ?,
            spot_status = ?,
            is_featured = ?,
            type_id = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
        [
          latitude ?? current.current_latitude,
          longitude ?? current.current_longitude,
            contact_phone ?? current.current_contact_phone,
            contact_email ?? current.current_contact_email,
            website ?? current.current_website,
            entry_fee ?? current.current_entry_fee,
            (typeof spot_status !== 'undefined' && spot_status !== null) ? spot_status : current.current_status,
            (typeof is_featured !== 'undefined' && is_featured !== null) ? is_featured : current.current_is_featured,
            type_id ?? current.current_type_id,
            id
        ]
      );

      await conn.commit();
      return res.json({ success: true, message: categoriesChanged ? "Updated (categories applied immediately)" : "No approval needed; fields updated" });
    }

    // Approval path: ensure no pending edit request
    const [[pendingRes]] = await db.query("CALL HasPendingEditRequest(?)", [id]);
    const hasPending = (pendingRes[0]?.pending_count ?? 0) > 0;
    if (hasPending) {
      return res.status(400).json({
        success: false,
        message: "There is already a pending edit request for this tourist spot.",
      });
    }

    if (categoriesChanged) {
      conn = await db.getConnection();
      await conn.beginTransaction();
      await conn.query("CALL DeleteCategoriesByTouristSpot(?)", [id]);
      for (let i = 0; i < category_ids.length; i++) { // eslint-disable-line no-plusplus
        await conn.query("CALL InsertTouristSpotCategory(?, ?)", [id, category_ids[i]]);
      }
      await conn.commit();
      conn.release();
      conn = null;
    }

    // Reuse existing address unless changed
    let address_id_to_use = current.address_id;
    if (addressChanged) {
      const [addressResult] = await db.query(
        "INSERT INTO address (province_id, municipality_id, barangay_id) VALUES (?, ?, ?)",
        [province_id, municipality_id, barangay_id]
      );
      address_id_to_use = addressResult.insertId;
    }

    const statusToSave = typeof spot_status !== 'undefined' && spot_status !== null ? spot_status : current.current_status;
    const featuredToSave = typeof is_featured !== 'undefined' && is_featured !== null ? is_featured : current.current_is_featured;

    await db.query("CALL SubmitTouristSpotEditRequest(?,?,?,?,?,?,?,?,?,?,?,?,?)", [
      id,
      name,
      description,
      address_id_to_use,
      latitude ?? current.current_latitude,
      longitude ?? current.current_longitude,
      contact_phone ?? current.current_contact_phone,
      contact_email ?? current.current_contact_email,
      website ?? current.current_website,
      entry_fee ?? current.current_entry_fee,
      statusToSave,
      featuredToSave,
      type_id ?? current.current_type_id,
    ]);

    return res.json({
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
