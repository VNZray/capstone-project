import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// get all types
export async function getAllTypes(request, response) {
  try {
    const [data] = await db.query("CALL GetAllTypes()");
    response.json(data[0]);
  } catch (error) {
    return handleDbError(error, response);
  }
}

// get all Accommodation and Shop types
export const getAccommodationAndShopTypes = async (request, response) => {
  try {
    const [data] = await db.query("CALL GetAccommodationAndShopTypes()");
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching Accommodation and Shop types:", error);
    return handleDbError(error, response);
  }
};

// get category by type id
export const getCategory = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetCategoryByTypeId(?)", [id]);
    response.json(data[0]);
  } catch (error) {
    console.error("Error fetching Accommodation and Shop Category:", error);
    return handleDbError(error, response);
  }
};

export const getTypeById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetTypeById(?)", [id]);
    response.json(data[0][0]);
  } catch (error) {
    console.error("Error fetching Type by ID:", error);
    return handleDbError(error, response);
  }
};

export const getCategoryById = async (request, response) => {
  const { id } = request.params;
  try {
    const [data] = await db.query("CALL GetCategoryById(?)", [id]);
    response.json(data[0][0]);
  } catch (error) {
    console.error("Error fetching Category by ID:", error);
    return handleDbError(error, response);
  }
};
