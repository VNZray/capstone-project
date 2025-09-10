import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

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

// get all addresses
export async function getAllAddresses(request, response) {
  try {
    const [data] = await db.query("CALL GetAllAddresses()");
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

//insert into address table
export async function insertAddress(request, response) {
  try {
    const { province_id, municipality_id, barangay_id } = request.body;
    const [result] = await db.query(
      "CALL InsertAddress(?, ?, ?)",
      [province_id, municipality_id, barangay_id]
    );
    response
      .status(201)
      .json({ id: result[0][0].id, province_id, municipality_id, barangay_id });
  } catch (error) {
    return handleDbError(error, response);
  }
}

// update data by ID
export async function updateAddress(request, response) {
  const { id } = request.params;
  try {
    const province_id = request.body.province_id ?? null;
    const municipality_id = request.body.municipality_id ?? null;
    const barangay_id = request.body.barangay_id ?? null;
    const [result] = await db.query(
      "CALL UpdateAddress(?, ?, ?, ?)",
      [id, province_id, municipality_id, barangay_id]
    );
    if (!result[0] || result[0].length === 0) {
      return response.status(404).json({ message: "Data not found" });
    }
    response.json(result[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// join tables get province, municipality, barangay by addresses id
export async function getAddressDetailsById(request, response) {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetAddressDetailsById(?)", [id]);
    response.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}
