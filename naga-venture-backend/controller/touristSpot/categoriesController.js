import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// Get categories and types for tourist spots
export const getCategoriesAndTypes = async (request, response) => {
  try {
    const [types] = await db.execute(
      "SELECT * FROM type ORDER BY type ASC"
    );

    const [categories] = await db.execute(
      `SELECT c.* FROM category c INNER JOIN type t ON c.type_id = t.id WHERE t.id = 4 ORDER BY c.category ASC`
    );

    response.json({
      success: true,
      data: {
        types,
        categories,
      },
      message: "Categories and types retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};
