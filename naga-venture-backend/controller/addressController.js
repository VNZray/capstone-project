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

// get all addresses
export async function getAllAddresses(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM address ORDER BY id ASC");
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

//insert into address table
export async function insertAddress(request, response) {
  try {
    const { province_id, municipality_id, barangay_id } = request.body;

    const [result] = await db.query(
      "INSERT INTO address (province_id, municipality_id, barangay_id) VALUES (?, ?, ?)",
      [province_id, municipality_id, barangay_id]
    );
    response
      .status(201)
      .json({ id: result.insertId, province_id, municipality_id, barangay_id });
  } catch (error) {
    return handleDbError(error, response);
  }
}

// update data by ID
export async function updateAddress(request, response) {
  const { id } = request.params;
  try {
    const fields = ["province_id", "municipality_id", "barangay_id"];
    const updates = fields.map((f) => request.body[f] ?? null);

    const [data] = await db.query(
      `UPDATE address
       SET ${fields.map((f) => `${f} = ?`).join(", ")}
       WHERE id = ?`,
      [...updates, id]
    );

    if (data.affectedRows === 0) {
      return response.status(404).json({ message: "Data not found" });
    }

    const [updated] = await db.query("SELECT * FROM address WHERE id = ?", [
      id,
    ]);

    response.json(updated);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// join tables get province, municipality, barangay by addresses id
export async function getAddressDetailsById(request, response) {
  const { id } = request.params;
  try {
    const query = `
      SELECT 
        p.id AS province_id, p.province AS province_name,
        m.id AS municipality_id, m.municipality AS municipality_name,
        b.id AS barangay_id, b.barangay AS barangay_name
      FROM address a
      LEFT JOIN barangay b ON a.barangay_id = b.id
      LEFT JOIN municipality m ON b.municipality_id = m.id
      LEFT JOIN province p ON m.province_id = p.id
      WHERE a.id = ?
    `;
    const [data] = await db.query(query, [id]);
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}
