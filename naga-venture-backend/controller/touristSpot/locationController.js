import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

export const getLocationData = async (request, response) => {
  try {
  const [data] = await db.query("CALL GetLocationData()");
  const provinces = data[0] || [];
  const municipalities = data[1] || [];
  const barangays = data[2] || [];

    response.json({
      success: true,
  data: { provinces, municipalities, barangays },
      message: "Location data retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Get municipalities by province
export const getMunicipalitiesByProvince = async (request, response) => {
  try {
    const { province_id } = request.params;
  const [data] = await db.query("CALL GetMunicipalitiesByProvince(?)", [province_id]);
  const municipalities = data[0] || [];

    response.json({
      success: true,
  data: municipalities,
      message: "Municipalities retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Get barangays by municipality
export const getBarangaysByMunicipality = async (request, response) => {
  try {
    const { municipality_id } = request.params;
  const [data] = await db.query("CALL GetBarangaysByMunicipality(?)", [municipality_id]);
  const barangays = data[0] || [];

    response.json({
      success: true,
  data: barangays,
      message: "Barangays retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Update address (province/municipality/barangay) for a tourist spot; submits approval only if changed
export const updateTouristSpotAddress = async (request, response) => {
  try {
    const { id } = request.params; // tourist spot id
    const { province_id, municipality_id, barangay_id, name, description } = request.body;
    if (!province_id || !municipality_id || !barangay_id) {
      return response.status(400).json({ success: false, message: 'province_id, municipality_id, barangay_id required' });
    }

    const [rows] = await db.query(`SELECT ts.id, ts.name, ts.description, ts.address_id, a.province_id, a.municipality_id, a.barangay_id
                                   FROM tourist_spots ts JOIN address a ON ts.address_id = a.id WHERE ts.id = ?`, [id]);
    if (!rows.length) return response.status(404).json({ success: false, message: 'Tourist spot not found' });
    const cur = rows[0];

    const addressChanged = cur.province_id !== Number(province_id) || cur.municipality_id !== Number(municipality_id) || cur.barangay_id !== Number(barangay_id);
    const norm = v => (v ?? '').toString().trim().replace(/\s+/g,' ');
    const nameChanged = typeof name === 'string' && norm(cur.name) !== norm(name);
    const descriptionChanged = typeof description === 'string' && norm(cur.description) !== norm(description);

    if (!addressChanged && !nameChanged && !descriptionChanged) {
      return response.json({ success: true, message: 'No changes detected' });
    }

    const finalName = nameChanged ? name : cur.name;
    const finalDesc = descriptionChanged ? description : cur.description;

    let newAddressId = cur.address_id;
    if (addressChanged) {
      const [addressInsert] = await db.query('INSERT INTO address (province_id, municipality_id, barangay_id) VALUES (?,?,?)', [province_id, municipality_id, barangay_id]);
      newAddressId = addressInsert.insertId;
    }

    // Submit approval request (uses current other fields; we only care about name/description/address for approval)
    await db.query('CALL SubmitTouristSpotEditRequest(?,?,?,?,?,?,?,?,?,?,?,?,?)', [
      id,
      finalName,
      finalDesc,
      newAddressId,
      null, null, null, null, null, null, // unchanged optional fields
      'pending',
      0,
      null
    ]);

    return response.json({ success: true, message: 'Address (and/or name/description) change submitted for approval' });
  } catch (error) {
    return handleDbError(error, response);
  }
};
