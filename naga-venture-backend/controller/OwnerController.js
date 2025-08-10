import db from "../db.js";

// Insert Owner Data
export const insertOwner = async (req, res) => {
  try {
    const { first_name, last_name, email, phone_number, business_type } =
      req.body;

    // Insert new owner
    await db.query(
      `INSERT INTO owner (first_name, last_name, email, phone_number, business_type) 
       VALUES (?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone_number, business_type]
    );

    // Fetch the owner row to get the UUID
    const [rows] = await db.query(
      `SELECT * FROM owner WHERE email = ? LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(500).json({
        status: "error",
        message: "Owner creation failed - not found after insert",
      });
    }

    const owner = rows[0];

    res.status(201).json({
      status: "success",
      data: { owner },
    });
  } catch (error) {
    console.error("Error inserting owner:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Get owner by ID
export async function getOwnerById(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM owner WHERE id = ?", [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Owner not found" });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// get all owners
export async function getAllOwners(req, res) {
  try {
    const [results] = await db.query("SELECT * FROM owner");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
export async function updateOwnerById(req, res) {
  const { id } = req.params;
  const allowedFields = [
    "first_name",
    "middle_name",
    "last_name",
    "age",
    "birthday",
    "gender",
    "email",
    "phone_number",
    "business_type",
    "province_id",
    "municipality_id",
    "barangay_id",
  ];

  // Filter only provided fields
  const fieldsToUpdate = Object.keys(req.body)
    .filter(key => allowedFields.includes(key));

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No valid fields provided for update" });
  }

  const values = fieldsToUpdate.map(field => req.body[field]);
  const setClause = fieldsToUpdate.map(field => `${field} = ?`).join(", ");

  try {
    const [result] = await db.query(
      `UPDATE owner SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Owner not found" });
    }

    res.json({ message: "Owner updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
