import db from "../db.js";

// get all provinces
export async function getAllProvinces(req, res) {
  try {
    const [results] = await db.query("SELECT * FROM province");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// get all municipalities
export const getAllMunicipalities = async (req, res) => {
  db.query("SELECT * FROM municipality", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// get all municipalities by province ID
export const getMunicipalitiesByProvinceId = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM municipality WHERE province_id = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching Municipalities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get all barangays
export const getAllBarangays = async (req, res) => {
  db.query("SELECT * FROM barangay", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
// get all barangays by municipality ID
export const getBarangaysByMunicipalityId = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM barangay WHERE municipality_id = ?",
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching Barangays:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
