import db from "../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../utils/errorHandler.js";

// Helper: normalize various date inputs to MySQL DATETIME string (YYYY-MM-DD HH:MM:SS)
// - Accepts ISO strings (e.g., 2025-11-04T00:47:00.000Z) or Date objects
// - Formats using UTC to avoid implicit timezone shifts in storage
// - Returns null if input is falsy or invalid
function toMySQLDateTime(input) {
  if (!input) return null;
  try {
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, "0");
    const YYYY = d.getUTCFullYear();
    const MM = pad(d.getUTCMonth() + 1);
    const DD = pad(d.getUTCDate());
    const HH = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    return `${YYYY}-${MM}-${DD} ${HH}:${mm}:${ss}`;
  } catch (_) {
    return null;
  }
}

// Get all promotions
export async function getAllPromotions(req, res) {
  try {
    const [data] = await db.query("CALL GetAllPromotions()");
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get promotions by business ID
export async function getPromotionsByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetPromotionsByBusinessId(?)", [businessId]);
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get active promotions by business ID
export async function getActivePromotionsByBusinessId(req, res) {
  const { businessId } = req.params;
  try {
    const [data] = await db.query("CALL GetActivePromotionsByBusinessId(?)", [businessId]);
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get all active promotions
export async function getAllActivePromotions(req, res) {
  try {
    const [data] = await db.query("CALL GetAllActivePromotions()");
    res.json(data[0]);
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
      promo_code,
      discount_percentage,
      fixed_discount_amount,
      usage_limit,
      start_date,
      end_date,
      promo_type
    } = req.body;

    // Normalize date inputs to MySQL DATETIME format
    const pStart = toMySQLDateTime(start_date);
    const pEnd = toMySQLDateTime(end_date);

    // Basic validation: end date must be after start date when both provided
    if (pStart && pEnd) {
      const startMs = new Date(pStart.replace(' ', 'T') + 'Z').getTime();
      const endMs = new Date(pEnd.replace(' ', 'T') + 'Z').getTime();
      if (!isNaN(startMs) && !isNaN(endMs) && endMs < startMs) {
        return res.status(400).json({ message: "end_date must be after start_date" });
      }
    }

    // Validate promo_type
    if (!promo_type || (promo_type !== 1 && promo_type !== 2)) {
      return res.status(400).json({ message: "promo_type must be 1 (discount) or 2 (promo_code)" });
    }

    const [data] = await db.query("CALL InsertPromotion(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id, 
      business_id, 
      title, 
      description || null,
      image_url || null,
      external_link || null,
      promo_code || null,
      discount_percentage || null,
      fixed_discount_amount || null,
      usage_limit || null,
      pStart,
      pEnd,
      promo_type
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
      promo_code,
      discount_percentage,
      fixed_discount_amount,
      usage_limit,
      start_date,
      end_date,
      is_active,
      promo_type
    } = req.body;

    // Normalize date inputs to MySQL DATETIME format
    const pStart = toMySQLDateTime(start_date);
    const pEnd = toMySQLDateTime(end_date);

    // Basic validation: end date must be after start date when both provided
    if (pStart && pEnd) {
      const startMs = new Date(pStart.replace(' ', 'T') + 'Z').getTime();
      const endMs = new Date(pEnd.replace(' ', 'T') + 'Z').getTime();
      if (!isNaN(startMs) && !isNaN(endMs) && endMs < startMs) {
        return res.status(400).json({ message: "end_date must be after start_date" });
      }
    }

    const [data] = await db.query("CALL UpdatePromotion(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      id, 
      title || null, 
      description || null,
      image_url || null,
      external_link || null,
      promo_code || null,
      discount_percentage || null,
      fixed_discount_amount || null,
      usage_limit || null,
      pStart, 
      pEnd,
      is_active !== undefined ? is_active : null,
      promo_type || null
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
