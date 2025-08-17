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

// get address by id
export async function getAddressById(request, response) {
  const { id } = request.params;
  try {
    const query = `
      SELECT province.province AS province_name, municipality.municipality AS municipality_name, barangay.barangay AS barangay_name
      FROM barangay
      INNER JOIN municipality ON barangay.municipality_id = municipality.id
      INNER JOIN province ON municipality.province_id = province.id
      WHERE barangay.id = ?
    `;
    const [data] = await db.query(query, [id]);
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get all address
export async function getAllAddresses(request, response) {
  try {
    const query = `
      SELECT 
        p.id AS province_id, p.province AS province_name,
        m.id AS municipality_id, m.municipality AS municipality_name,
        b.id AS barangay_id, b.barangay AS barangay_name
      FROM province p
      LEFT JOIN municipality m ON m.province_id = p.id
      LEFT JOIN barangay b ON b.municipality_id = m.id
      ORDER BY p.province, m.municipality, b.barangay
    `;

    const [rows] = await db.query(query);

    // Transform rows into nested structure
    const provinces = [];

    rows.forEach((row) => {
      // Find or create province
      let province = provinces.find((p) => p.province_id === row.province_id);
      if (!province) {
        province = {
          province_id: row.province_id,
          province_name: row.province_name,
          municipalities: [],
        };
        provinces.push(province);
      }

      // If municipality exists in row
      if (row.municipality_id) {
        let municipality = province.municipalities.find(
          (m) => m.municipality_id === row.municipality_id
        );
        if (!municipality) {
          municipality = {
            municipality_id: row.municipality_id,
            municipality_name: row.municipality_name,
            barangays: [],
          };
          province.municipalities.push(municipality);
        }

        // If barangay exists in row
        if (row.barangay_id) {
          municipality.barangays.push({
            barangay_id: row.barangay_id,
            barangay_name: row.barangay_name,
          });
        }
      }
    });

    response.json(provinces);
  } catch (error) {
    return handleDbError(error, response);
  }
}
