import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// get all categories
export async function getAllCategories(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM category");
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get all Accommodation and Shop categories
export const getAccommodationAndShopCategories = async (request, response) => {
  try {
    const [data] = await db.query(
      "SELECT * FROM category WHERE category IN ('Accommodation', 'Shop')"
    );
    response.json(data);
  } catch (error) {
    console.error("Error fetching Accommodation and Shop categories:", error);
    return handleDbError(error, response);
  }
};

// get all Accommodation and Shop Types
export const getTypes = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("SELECT * FROM type WHERE category_id = ?", [
      id,
    ]);
    response.json(data);
  } catch (error) {
    console.error("Error fetching Accommodation and Shop types:", error);
    return handleDbError(error, response);
  }
};
