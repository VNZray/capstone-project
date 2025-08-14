import db from "../db.js";
import { v4 as uuidv4 } from "uuid";

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
  console.log("Owner ID received:", id); // 🛠 debug
  try {
    const [results] = await db.query(
      "SELECT * FROM business WHERE owner_id = ?",
      [id]
    );
    console.log("Query results:", results); // 🛠 debug
    if (results.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getBusinessId(req, res) {
  const { id } = req.params;
  try {
    const [results] = await db.query("SELECT * FROM business WHERE id = ?", [
      id,
    ]);
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
    // Generate UUID for the new business
    const businessId = uuidv4();

    const fields = [
      "id", // include the id field
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
      "hasBooking",
    ];

    const values = [
      businessId, // first value is the UUID
      ...fields.slice(1).map((f) => req.body[f] ?? null),
    ];

    // Insert with known UUID
    await db.query(
      `INSERT INTO business (${fields.join(", ")})
       VALUES (${fields.map(() => "?").join(", ")})`,
      values
    );

    // Retrieve the inserted row by UUID
    const [inserted] = await db.query("SELECT * FROM business WHERE id = ?", [
      businessId,
    ]);

    if (inserted.length === 0) {
      return res.status(404).json({ error: "Inserted business not found" });
    }

    res.status(201).json({
      message: "Business created successfully",
      data: inserted[0], // full row including UUID
    });
  } catch (err) {
    console.error("Error inserting business:", err);
    res.status(500).json({ error: err.message });
  }
}
