import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// get all categories
export async function getAllTypes(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM type");
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get all Accommodation and Shop categories
export const getAccommodationAndShopTypes = async (request, response) => {
  try {
    const [data] = await db.query(
      "SELECT * FROM type WHERE type IN ('Accommodation', 'Shop')"
    );
    response.json(data);
  } catch (error) {
    console.error("Error fetching Accommodation and Shop categories:", error);
    return handleDbError(error, response);
  }
};

// get all Accommodation and Shop Category
export const getCategory = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM category WHERE type_id = ?", [
      id,
    ]);
    response.json(data);
  } catch (error) {
    console.error("Error fetching Accommodation and Shop Category:", error);
    return handleDbError(error, response);
  }
};

// get address by id
export async function getCategoryAndType(request, response) {
  const { id } = request.params;
  try {
    const query = `
      SELECT category.category AS category_name, type.type AS type_name
      FROM category
      INNER JOIN category ON type.id = category.type_id
      WHERE category.id = ?
    `;
    const [data] = await db.query(query, [id]);
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}
