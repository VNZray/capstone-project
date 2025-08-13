import db from "../db.js";

// Get all tourists
export async function getAllTourists(req, res) {
  try {
    const [results] = await db.query("SELECT * FROM tourist");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get tourist by ID
export async function getTouristById(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM tourist WHERE id = ?", [
      id,
    ]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Tourist not found" });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create new tourist
export async function createTourist(req, res) {
  const {
    first_name,
    middle_name,
    last_name,
    ethnicity,
    birthday,
    age,
    gender,
    nationality,
    category,
    phone_number,
    email,
    province_id,
    municipality_id,
    barangay_id,
  } = req.body;

  try {
    const sql = `
      INSERT INTO tourist 
      (first_name, middle_name, last_name, ethnicity, birthday, age, gender, nationality, category, phone_number, email, province_id, municipality_id, barangay_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      first_name,
      middle_name,
      last_name,
      ethnicity,
      birthday,
      age,
      gender,
      nationality,
      category,
      phone_number,
      email,
      province_id,
      municipality_id,
      barangay_id,
    ];

    const [result] = await db.query(sql, values);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
