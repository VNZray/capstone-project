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

