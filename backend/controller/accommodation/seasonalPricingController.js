import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";

/**
 * Seasonal Pricing Controller
 * Handles CRUD operations and price calculations for seasonal pricing
 */

const SEASONAL_PRICING_FIELDS = [
  "business_id",
  "room_id",
  "base_price",
  "weekend_price",
  "weekend_days",
  "peak_season_price",
  "peak_season_months",
  "high_season_price",
  "high_season_months",
  "low_season_price",
  "low_season_months",
  "is_active",
];

/**
 * Get all seasonal pricing configurations
 */
export async function getAllSeasonalPricing(req, res) {
  try {
    const [rows] = await db.query("CALL GetAllSeasonalPricing()");
    res.json(rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Get seasonal pricing by ID
 */
export async function getSeasonalPricingById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query("CALL GetSeasonalPricingById(?)", [id]);
    if (!rows[0] || rows[0].length === 0) {
      return res.status(404).json({ message: "Seasonal pricing not found" });
    }
    res.json(rows[0][0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Get seasonal pricing by business ID
 */
export async function getSeasonalPricingByBusinessId(req, res) {
  try {
    const { business_id } = req.params;
    const [rows] = await db.query("CALL GetSeasonalPricingByBusinessId(?)", [business_id]);
    res.json(rows[0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Get seasonal pricing by room ID
 */
export async function getSeasonalPricingByRoomId(req, res) {
  try {
    const { room_id } = req.params;
    const [rows] = await db.query("CALL GetSeasonalPricingByRoomId(?)", [room_id]);
    if (!rows[0] || rows[0].length === 0) {
      return res.status(404).json({ message: "No seasonal pricing configured for this room" });
    }
    res.json(rows[0][0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Create seasonal pricing configuration
 */
export async function insertSeasonalPricing(req, res) {
  try {
    const {
      business_id,
      room_id = null,
      base_price,
      weekend_price = null,
      weekend_days = null,
      peak_season_price = null,
      peak_season_months = null,
      high_season_price = null,
      high_season_months = null,
      low_season_price = null,
      low_season_months = null,
      is_active = true,
    } = req.body;

    // Validation
    if (!business_id) {
      return res.status(400).json({ error: "business_id is required" });
    }

    if (!base_price && base_price !== 0) {
      return res.status(400).json({ error: "base_price is required" });
    }

    const id = uuidv4();

    const [rows] = await db.query(
      "CALL InsertSeasonalPricing(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        business_id,
        room_id,
        base_price,
        weekend_price,
        weekend_days ? JSON.stringify(weekend_days) : null,
        peak_season_price,
        peak_season_months ? JSON.stringify(peak_season_months) : null,
        high_season_price,
        high_season_months ? JSON.stringify(high_season_months) : null,
        low_season_price,
        low_season_months ? JSON.stringify(low_season_months) : null,
        is_active,
      ]
    );

    res.status(201).json({
      message: "Seasonal pricing created successfully",
      data: rows[0][0],
    });
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Update seasonal pricing configuration
 */
export async function updateSeasonalPricing(req, res) {
  try {
    const { id } = req.params;
    const {
      base_price,
      weekend_price,
      weekend_days,
      peak_season_price,
      peak_season_months,
      high_season_price,
      high_season_months,
      low_season_price,
      low_season_months,
      is_active,
    } = req.body;

    const [rows] = await db.query(
      "CALL UpdateSeasonalPricing(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        base_price ?? null,
        weekend_price ?? null,
        weekend_days ? JSON.stringify(weekend_days) : null,
        peak_season_price ?? null,
        peak_season_months ? JSON.stringify(peak_season_months) : null,
        high_season_price ?? null,
        high_season_months ? JSON.stringify(high_season_months) : null,
        low_season_price ?? null,
        low_season_months ? JSON.stringify(low_season_months) : null,
        is_active ?? null,
      ]
    );

    if (!rows[0] || rows[0].length === 0) {
      return res.status(404).json({ message: "Seasonal pricing not found" });
    }

    res.json({
      message: "Seasonal pricing updated successfully",
      data: rows[0][0],
    });
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Delete seasonal pricing configuration
 */
export async function deleteSeasonalPricing(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await db.query("CALL DeleteSeasonalPricing(?)", [id]);

    if (rows[0][0].affected_rows === 0) {
      return res.status(404).json({ message: "Seasonal pricing not found" });
    }

    res.json({ message: "Seasonal pricing deleted successfully" });
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Calculate price for a specific date
 */
export async function calculatePriceForDate(req, res) {
  try {
    const { room_id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "date query parameter is required" });
    }

    const [rows] = await db.query("CALL CalculatePriceForDate(?, ?)", [room_id, date]);
    res.json(rows[0][0]);
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Calculate total price for a date range
 */
export async function calculatePriceForDateRange(req, res) {
  try {
    const { room_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date and end_date query parameters are required" });
    }

    const [rows] = await db.query("CALL CalculatePriceForDateRange(?, ?, ?)", [
      room_id,
      start_date,
      end_date,
    ]);

    // First result set is the breakdown, second is the summary
    const breakdown = rows[0];
    const summary = rows[1] ? rows[1][0] : { total_price: 0, nights: 0 };

    res.json({
      breakdown,
      summary: {
        total_price: summary.total_price,
        nights: summary.nights,
        check_in: summary.check_in,
        check_out: summary.check_out,
      },
    });
  } catch (err) {
    handleDbError(err, res);
  }
}

/**
 * Upsert seasonal pricing (create or update)
 * If room_id is provided, updates/creates for that room
 * If no room_id, updates/creates business-wide pricing
 */
export async function upsertSeasonalPricing(req, res) {
  try {
    const {
      business_id,
      room_id = null,
      base_price,
      weekend_price,
      weekend_days,
      peak_season_price,
      peak_season_months,
      high_season_price,
      high_season_months,
      low_season_price,
      low_season_months,
      is_active = true,
    } = req.body;

    if (!business_id) {
      return res.status(400).json({ error: "business_id is required" });
    }

    // Check if pricing config already exists
    let existingId = null;
    if (room_id) {
      const [existing] = await db.query("CALL GetSeasonalPricingByRoomId(?)", [room_id]);
      if (existing[0] && existing[0].length > 0) {
        existingId = existing[0][0].id;
      }
    } else {
      const [existing] = await db.query("CALL GetSeasonalPricingByBusinessId(?)", [business_id]);
      const businessWide = existing[0]?.find((p) => p.room_id === null);
      if (businessWide) {
        existingId = businessWide.id;
      }
    }

    if (existingId) {
      // Update existing
      req.params = { id: existingId };
      return updateSeasonalPricing(req, res);
    } else {
      // Create new
      return insertSeasonalPricing(req, res);
    }
  } catch (err) {
    handleDbError(err, res);
  }
}
