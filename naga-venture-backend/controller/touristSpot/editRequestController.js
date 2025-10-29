import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";


export const submitEditRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, barangay_id,
      latitude, longitude, contact_phone, contact_email, website,
      entry_fee, type_id, spot_status, is_featured
    } = req.body;

    if (!id || !name || !description || !barangay_id || !type_id) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const spotResults = await db.query(`CALL GetTouristSpotById(?)`, [id]);
    const spotRows = (spotResults && spotResults[0]) ? spotResults[0] : [];
    if (!spotRows.length) {
      return res.status(404).json({ success: false, message: "Tourist spot not found" });
    }
    const current = spotRows[0];

    // Normalize text fields
    const normalize = v => (v ?? '').toString().trim().replace(/\s+/g, ' ');
    const changed = {
      name: normalize(current.name) !== normalize(name),
      description: normalize(current.description) !== normalize(description),
      address: (current.barangay_id !== Number(barangay_id)),
      latitude: Number(current.latitude) !== Number(latitude),
      longitude: Number(current.longitude) !== Number(longitude),
      contact_phone: normalize(current.contact_phone) !== normalize(contact_phone),
      contact_email: normalize(current.contact_email) !== normalize(contact_email),
      website: normalize(current.website) !== normalize(website),
      entry_fee: Number(current.entry_fee) !== Number(entry_fee),
      spot_status: current.spot_status !== spot_status,
      type_id: Number(current.type_id) !== Number(type_id)
    };

  const approvalFields = [changed.name, changed.description, changed.address, changed.type_id];
    const directFields = [changed.latitude, changed.longitude, changed.contact_phone, changed.contact_email, changed.website, changed.entry_fee, changed.spot_status];

    let categoriesChanged = false;
    if (Array.isArray(req.body.category_ids)) {
      const [currentCategoriesRows] = await db.query('CALL GetTouristSpotCategoryIds(?)', [id]);
      const currentCategoryIds = (currentCategoriesRows[0] || []).map(row => row.category_id).sort();
      const newCategoryIds = req.body.category_ids.map(Number).sort();
      categoriesChanged = JSON.stringify(currentCategoryIds) !== JSON.stringify(newCategoryIds);
      if (categoriesChanged) {
        // Delete all current categories
        await db.query('CALL DeleteCategoriesByTouristSpot(?)', [id]);
        // Insert each new category
        for (const catId of newCategoryIds) {
          await db.query('CALL InsertTouristSpotCategory(?, ?)', [id, catId]);
        }
      }
    }

    if (!Object.values(changed).some(Boolean) && categoriesChanged) {
      return res.json({ success: true, message: "Categories updated successfully!" });
    }

    if (directFields.some(Boolean) && !approvalFields.some(Boolean)) {
      await db.query('CALL UpdateTouristSpotDirectFields(?, ?, ?, ?, ?, ?, ?, ?)', [
        id,
        latitude ?? current.latitude,
        longitude ?? current.longitude,
        contact_phone ?? current.contact_phone,
        contact_email ?? current.contact_email,
        website ?? current.website,
        entry_fee ?? current.entry_fee,
        spot_status ?? current.spot_status
      ]);
      return res.json({ success: true, message: "Fields updated successfully!" });
    }

    // If any approval-required field changed
    let barangay_id_to_use = current.barangay_id;
    if (changed.address) {
      barangay_id_to_use = barangay_id;
    }
    await db.query("CALL SubmitTouristSpotEditRequest(?,?,?,?,?,?,?,?,?,?,?,?)", [
      id,
      name,
      description,
      barangay_id_to_use,
      latitude ?? current.latitude,
      longitude ?? current.longitude,
      contact_phone ?? current.contact_phone,
      contact_email ?? current.contact_email,
      website ?? current.website,
      entry_fee ?? current.entry_fee,
      spot_status ?? current.spot_status,
      Number(current.is_featured) ? 1 : 0,
      type_id ?? current.type_id,
    ]);
    return res.json({ success: true, message: "Core information changes submitted for approval!" });
  } catch (error) {
    return handleDbError(error, res);
  }
};
