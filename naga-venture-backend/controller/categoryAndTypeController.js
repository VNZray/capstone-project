import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// get all types
export async function getAllTypes(request, response) {
  try {
    const [data] = await db.query("SELECT * FROM type");
    response.json(data);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get all Accommodation and Shop types
export const getAccommodationAndShopTypes = async (request, response) => {
  try {
    const [data] = await db.query(
      "SELECT * FROM type WHERE type IN ('Accommodation', 'Shop')"
    );
    response.json(data);
  } catch (error) {
    console.error("Error fetching Accommodation and Shop types:", error);
    return handleDbError(error, response);
  }
};

// get category by type id
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
