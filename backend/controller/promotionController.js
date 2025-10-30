import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// Get all promotions
export async function getAllPromotions(req, res) {
  try {
    const [data] = await db.query("CALL GetAllPromotions()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get promotions by business ID
export async function getPromotionsByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetPromotionsByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get active promotions by business ID
export async function getActivePromotionsByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetActivePromotionsByBusinessId(?)", [businessId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get all active promotions
export async function getAllActivePromotions(req, res) {
  try {
    const [data] = await db.query("CALL GetAllActivePromotions()");
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get promotion by ID
export async function getPromotionById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetPromotionById(?)", [id]);
    
    // MySQL stored procedures return: [[rows], metadata]
    // data[0] is the first result set (array of rows)
    // We need to return the first row as a single object
    
    if (!data || !data[0] || data[0].length === 0) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    // Return single object (first row from first result set)
    res.json(data[0][0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Create a new promotion
export async function insertPromotion(req, res) {
  try {
    const id = uuidv4();
    const {
      business_id,
      title,
      description,
      image_url,
      external_link,
      start_date,
      end_date
    } = req.body;

    const [data] = await db.query("CALL InsertPromotion(?, ?, ?, ?, ?, ?, ?, ?)", [
      id, 
      business_id, 
      title, 
      description || null,
      image_url || null,
      external_link || null,
      start_date || null,
      end_date || null
    ]);
    
    res.status(201).json({
      message: "Promotion created successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update promotion
export async function updatePromotion(req, res) {
  const { id } = req.params;
  try {
    const {
      title,
      description,
      image_url,
      external_link,
      start_date,
      end_date,
      is_active
    } = req.body;

    const [data] = await db.query("CALL UpdatePromotion(?, ?, ?, ?, ?, ?, ?, ?)", [
      id, 
      title || null, 
      description || null,
      image_url || null,
      external_link || null,
      start_date || null, 
      end_date || null,
      is_active !== undefined ? is_active : null
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Promotion not found" });
    }

    res.json({
      message: "Promotion updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete promotion
export async function deletePromotion(req, res) {
  const { id } = req.params;
  try {
    await db.query("CALL DeletePromotion(?)", [id]);
    res.json({ message: "Promotion deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update expired promotions
export async function updateExpiredPromotions(req, res) {
  try {
    const [results] = await db.query("CALL UpdateExpiredPromotions()");
    
    if (!results || results.length === 0) {
      return res.json({ 
        message: "No expired promotions to update",
        updated_count: 0 
      });
    }

    const result = results[0][0] || { updated_count: 0 };

    res.json({
      message: "Expired promotions updated successfully",
      updated_count: result.updated_count
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
