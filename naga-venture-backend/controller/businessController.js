import db from "../db.js";

// Get all businesses
export async function getAllBusiness(req, res) {
  try {
    const [results] = await db.query("SELECT * FROM business");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get business by owner ID
export async function getBusinessByOwnerId(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query(
      "SELECT * FROM business WHERE owner_id = ?",
      [id]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Insert a new business
export async function insertBusiness(req, res) {
  try {
    const fields = [
      "business_name",
      "business_type_id",
      "business_category_id",
      "phone_number",
      "email",
      "barangay_id",
      "municipality_id",
      "province_id",
      "description",
      "instagram_url",
      "tiktok_url",
      "facebook_url",
      "latitude",
      "longitude",
      "min_price",
      "max_price",
      "owner_id",
      "status",
      "business_image",
    ];

    const values = fields.map((f) => req.body[f] ?? null); // Ensure null for missing fields

    const [result] = await db.query(
      `INSERT INTO business (
        ${fields.join(", ")}
      ) VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    res.status(201).json({
      message: "Business created successfully",
      business_id: result.insertId,
    });
  } catch (err) {
    console.error("Error inserting business:", err);
    res.status(500).json({ error: err.message });
  }
}
