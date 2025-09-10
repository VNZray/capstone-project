import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

export const getLocationData = async (request, response) => {
  try {
    // Get all provinces
    const [provinces] = await db.execute(
      "SELECT * FROM province ORDER BY province ASC"
    );

    // Get all municipalities
    const [municipalities] = await db.execute(
      "SELECT * FROM municipality ORDER BY municipality ASC"
    );

    // Get all barangays
    const [barangays] = await db.execute(
      "SELECT * FROM barangay ORDER BY barangay ASC"
    );

    response.json({
      success: true,
      data: {
        provinces,
        municipalities,
        barangays,
      },
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

    const [municipalities] = await db.execute(
      "SELECT * FROM municipality WHERE province_id = ? ORDER BY municipality ASC",
      [province_id]
    );

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

    const [barangays] = await db.execute(
      "SELECT * FROM barangay WHERE municipality_id = ? ORDER BY barangay ASC",
      [municipality_id]
    );

    response.json({
      success: true,
      data: barangays,
      message: "Barangays retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};
