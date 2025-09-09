import db from "../../db.js";
import { handleDbError } from "../../utils/errorHandler.js";

// Get categories for a tourist spot
export const getTouristSpotCategories = async (request, response) => {
  try {
    const { id } = request.params;

    const [data] = await db.execute(`
      SELECT 
        c.id,
        c.category,
        c.type_id
      FROM tourist_spot_categories tsc
      JOIN category c ON tsc.category_id = c.id
      WHERE tsc.tourist_spot_id = ?
      ORDER BY c.category ASC
    `, [id]);

    response.json({
      success: true,
      data: data,
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

    // Validate that all category IDs exist
    if (category_ids.length > 0) {
      const placeholders = category_ids.map(() => '?').join(',');
      const [categoryCheck] = await db.execute(
        `SELECT id FROM category WHERE id IN (${placeholders})`,
        category_ids
      );

      if (categoryCheck.length !== category_ids.length) {
        return response.status(400).json({
          success: false,
          message: "One or more invalid category IDs provided",
        });
      }
    }
    
    // Start transaction
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Delete existing categories for this tourist spot
    await conn.execute(
      "DELETE FROM tourist_spot_categories WHERE tourist_spot_id = ?",
      [id]
    );

    // Insert new categories
    if (category_ids.length > 0) {
      const values = [];
      const placeholders = [];
      
      category_ids.forEach(categoryId => {
        placeholders.push("(UUID(), ?, ?)");
        values.push(id, categoryId);
      });

      await conn.execute(
        `INSERT INTO tourist_spot_categories (id, tourist_spot_id, category_id) 
         VALUES ${placeholders.join(",")}`,
        values
      );
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
