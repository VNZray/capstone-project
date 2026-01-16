import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// Get categories and types for tourist spots
export const getCategoriesAndTypes = async (request, response) => {
  try {
    const [data] = await db.query("CALL GetTouristSpotCategoriesAndTypes()");
    const types = data[0] || [];
    const categories = data[1] || [];

    response.json({
      success: true,
      data: { types, categories },
      message: "Categories and types retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};
