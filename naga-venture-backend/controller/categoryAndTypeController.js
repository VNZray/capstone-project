import db from "../db.js";

// get all categories
export async function getAllCategories(req, res) {
  try {
    const [results] = await db.query("SELECT * FROM category");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// get all Accommodation and Shop categories
export const getAccommodationAndShopCategories = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM category WHERE category IN ('Accommodation', 'Shop')"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching Accommodation and Shop categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// get all Accommodation and Shop Types
export const getTypes = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM type WHERE category_id = ?", [
      id,
    ]);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching Accommodation and Shop types:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
