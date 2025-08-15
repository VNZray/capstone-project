import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// get all provinces
export async function getAllProvinces(request, response) {
  try {
    const [data] = await db.query(
      "SELECT * FROM province ORDER BY province ASC"
    );
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

export const getProvinceById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM province WHERE id = ?", [id]);
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching Province:", error);
    response.status(500).json({ error: "Internal server error" });
  }
};

// get all municipalities
export async function getAllMunicipalities(request, response) {
  try {
    const [data] = await db.query(
      "SELECT * FROM municipality ORDER BY municipality ASC"
    );
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

export const getMunicipalityById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM municipality WHERE id = ?", [
      id,
    ]);
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching Municipality:", error);
    return handleDbError(error, response);
  }
};

// get all municipalities by province ID
export const getMunicipalitiesByProvinceId = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query(
      "SELECT * FROM municipality WHERE province_id = ?",
      [id]
    );
    response.json(data);
  } catch (error) {
    console.error("Error fetching Municipalities:", error);
    return handleDbError(error, response);
  }
};

// get all barangays
export async function getAllBarangays(request, response) {
  try {
    const [data] = await db.query(
      "SELECT * FROM barangay ORDER BY barangay ASC"
    );
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

export const getBarangayById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM barangay WHERE id = ?", [id]);
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching Barangay:", error);
    return handleDbError(error, response);
  }
};

// get all barangays by municipality ID
export const getBarangaysByMunicipalityId = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query(
      "SELECT * FROM barangay WHERE municipality_id = ? ORDER BY barangay ASC",
      [id]
    );
    response.json(data);
  } catch (error) {
    console.error("Error fetching Barangays:", error);
    return handleDbError(error, response);
  }
};
