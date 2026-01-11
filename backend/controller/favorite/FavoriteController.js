import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";
import { v4 as uuidv4 } from "uuid";

const FAVORITE_FIELDS = [
    "tourist_id",
    "favorite_type",
    "my_favorite_id",
];

const makePlaceholders = (n) => Array(n).fill("?").join(",");
const buildFavoriteParams = (id, body) => [
  id,
  ...FAVORITE_FIELDS.map((f) => body?.[f] ?? null),
];


// Get all favorites
export async function getAllFavorites(req, res) {
  try {
    const [data] = await db.query("CALL GetAllFavorites()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get favorite by ID
export async function getFavoriteById(req, res) {
  try {
    const { id } = req.params;
    const [data] = await db.query("CALL GetFavoriteById(?)", [id]);
    res.json(data);
    } catch (error) {
    return handleDbError(error, res);
  }
}

// Get favorites by tourist ID
export async function getFavoritesByTouristId(req, res) {
  try {
    const { tourist_id } = req.params;
    const [data] = await db.query("CALL GetFavoritesByTouristId(?)", [tourist_id]);
    // data is already an array from the stored procedure, return it directly
    res.json(Array.isArray(data[0]) ? data[0] : data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Add a new favorite
export async function addFavorite(req, res) {
  try {
    const body = req.body;
    const id = uuidv4();
    const params = buildFavoriteParams(id, body);
    const placeholders = makePlaceholders(FAVORITE_FIELDS.length + 1);

    await db.query(
      `CALL AddFavorite(${placeholders})`,
      params
    );
    res.status(201).json({ message: "Favorite added successfully", id });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update a favorite
export async function updateFavorite(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;
    const params = buildFavoriteParams(id, body);
    const placeholders = makePlaceholders(FAVORITE_FIELDS.length + 1);

    await db.query(
      `CALL UpdateFavorite(${placeholders})`,
      params
    );
    res.json({ message: "Favorite updated successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete a favorite
export async function deleteFavorite(req, res) {
  try {
    const { id } = req.params;
    await db.query("CALL DeleteFavoriteById(?)", [id]);
    res.json({ message: "Favorite deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete a favorite by tourist and item (alternative deletion method)
export async function deleteFavoriteByItem(req, res) {
  try {
    const { tourist_id, favorite_type, my_favorite_id } = req.body;

    if (!tourist_id || !favorite_type || !my_favorite_id) {
      return res.status(400).json({
        error: "Missing required fields: tourist_id, favorite_type, my_favorite_id"
      });
    }

    await db.query(
      "CALL DeleteFavoriteByItem(?, ?, ?)",
      [tourist_id, favorite_type, my_favorite_id]
    );
    res.json({ message: "Favorite deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Check if a favorite exists
export async function checkFavoriteExists(req, res) {
  try {
    const { tourist_id, favorite_type, my_favorite_id } = req.query;

    if (!tourist_id || !favorite_type || !my_favorite_id) {
      return res.status(400).json({
        error: "Missing required query parameters: tourist_id, favorite_type, my_favorite_id"
      });
    }

    const [data] = await db.query(
      "CALL CheckFavoriteExists(?, ?, ?)",
      [tourist_id, favorite_type, my_favorite_id]
    );

    const exists = data && data[0] && data[0].length > 0;
    const favoriteId = exists ? data[0][0].id : null;

    res.json({ exists, favoriteId });
  } catch (error) {
    return handleDbError(error, res);
  }
}
