import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// Get categories for a tourist spot
export const getTouristSpotCategories = async (request, response) => {
  try {
    const { id } = request.params;

    const [data] = await db.query("CALL GetTouristSpotCategories(?)", [id]);
    const rows = data[0] || [];

    response.json({
      success: true,
      data: rows,
      message: "Tourist spot categories retrieved successfully",
    });
  } catch (error) {
    return handleDbError(error, response);
  }
};

// Update categories for a tourist spot
export const updateTouristSpotCategories = async (request, response) => {
  let conn;
  try {
    const { id } = request.params;
    const { category_ids } = request.body;

    if (!Array.isArray(category_ids)) {
      return response.status(400).json({
        success: false,
        message: "category_ids must be an array",
      });
    }

    // Start transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Delete existing categories for this tourist spot
    await conn.query("CALL DeleteCategoriesByTouristSpot(?)", [id]);

    // Insert new categories
    if (category_ids.length > 0) {
      for (let i = 0; i < category_ids.length; i++) {
        await conn.query("CALL InsertTouristSpotCategory(?, ?)", [id, category_ids[i]]);
      }
    }

    await conn.commit();

    response.json({
      success: true,
      message: "Tourist spot categories updated successfully",
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    return handleDbError(error, response);
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
