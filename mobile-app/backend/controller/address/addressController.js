/**
 * Address Controller (Mobile Backend)
 * Handles province, municipality, and barangay lookups
 */

import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// get all provinces
export async function getAllProvinces(request, response) {
  try {
    const [data] = await db.query("CALL GetAllProvinces()");
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

export const getProvinceById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetProvinceById(?)", [id]);
    response.json(data[0][0]);
  } catch (error) {
    console.error("Error fetching Province:", error);
    response.status(500).json({ error: "Internal server error" });
  }
};

// get all municipalities
export async function getAllMunicipalities(request, response) {
  try {
    const [data] = await db.query("CALL GetAllMunicipalities()");
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

export const getMunicipalityById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetMunicipalityById(?)", [id]);
    response.json(data[0][0]);
  } catch (error) {
    console.error("Error fetching Municipality:", error);
    return handleDbError(error, response);
  }
};

// get all municipalities by province ID
export const getMunicipalitiesByProvinceId = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetMunicipalitiesByProvinceId(?)", [id]);
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching Municipalities:", error);
    return handleDbError(error, response);
  }
};

// get all barangays
export async function getAllBarangays(request, response) {
  try {
    const [data] = await db.query("CALL GetAllBarangays()");
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

export const getBarangayById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetBarangayById(?)", [id]);
    response.json(data[0][0]);
  } catch (error) {
    console.error("Error fetching Barangay:", error);
    return handleDbError(error, response);
  }
};

// get all barangays by municipality ID
export const getBarangaysByMunicipalityId = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetBarangaysByMunicipalityId(?)", [id]);
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching Barangays:", error);
    return handleDbError(error, response);
  }
};

export async function GetFullAddressByBarangayId(request, response) {
  const { id } = request.params;

  try {
    const [data] = await db.query("CALL GetFullAddressByBarangayId(?)", [id]);
    response.json(data[0][0]);
  } catch (error) {
    console.error("Error fetching Address:", error);
    return handleDbError(error, response);
  }
}
