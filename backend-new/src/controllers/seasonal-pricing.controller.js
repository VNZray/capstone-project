/**
 * Seasonal Pricing Controller
 *
 * Handles CRUD operations and price calculations for month-based seasonal pricing
 * Uses peak/high/low seasons and weekend pricing
 */
import { SeasonalPricing, Room, Business, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';
import { Op } from 'sequelize';

/**
 * Get all seasonal pricing configurations
 */
export const getAllSeasonalPricing = async (req, res, next) => {
  try {
    const results = await SeasonalPricing.findAll({
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name']
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number', 'room_type']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get seasonal pricing by ID
 */
export const getSeasonalPricingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await SeasonalPricing.findByPk(id, {
      include: [
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name']
        },
        {
          model: Room,
          as: 'room',
          attributes: ['id', 'room_number', 'room_type', 'room_price']
        }
      ]
    });

    if (!result) {
      throw ApiError.notFound('Seasonal pricing not found');
    }

    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get seasonal pricing by business ID
 */
export const getSeasonalPricingByBusinessId = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const results = await SeasonalPricing.findAll({
      where: {
        business_id: businessId,
        is_active: true
      },
      include: [{
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number', 'room_type']
      }],
      order: [['created_at', 'DESC']]
    });

    res.success(results);
  } catch (error) {
    next(error);
  }
};

/**
 * Get seasonal pricing by room ID
 * Returns single pricing configuration for the room or null if not found
 */
export const getSeasonalPricingByRoomId = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const result = await SeasonalPricing.findOne({
      where: {
        room_id: roomId,
        is_active: true
      },
      include: [{
        model: Room,
        as: 'room',
        attributes: ['id', 'room_number', 'room_type', 'room_price']
      }]
    });

    // Return null if not found instead of throwing 404
    // This allows the frontend to handle "no pricing configured" gracefully
    res.success(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate price for a specific date using month-based seasonal pricing
 */
export const calculatePriceForDate = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { date } = req.query;

    if (!date) {
      throw ApiError.badRequest('Date is required');
    }

    // Get room info
    const room = await Room.findByPk(roomId);
    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    // Get seasonal pricing config
    const pricing = await SeasonalPricing.findOne({
      where: {
        room_id: roomId,
        is_active: true
      }
    });

    const dateObj = new Date(date + 'T00:00:00');
    const month = dateObj.getMonth() + 1; // getMonth() is 0-indexed
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    let finalPrice = room.room_price;
    let priceType = 'default';

    if (pricing) {
      // Start with base price
      finalPrice = Number(pricing.base_price) || room.room_price;
      priceType = 'base';

      // Parse month arrays
      const peakMonths = parseJsonArray(pricing.peak_season_months);
      const highMonths = parseJsonArray(pricing.high_season_months);
      const lowMonths = parseJsonArray(pricing.low_season_months);
      const weekendDays = parseJsonArray(pricing.weekend_days);

      // Check seasonal pricing (priority: peak > high > low)
      if (peakMonths.includes(month) && pricing.peak_season_price) {
        finalPrice = Number(pricing.peak_season_price);
        priceType = 'peak_season';
      } else if (highMonths.includes(month) && pricing.high_season_price) {
        finalPrice = Number(pricing.high_season_price);
        priceType = 'high_season';
      } else if (lowMonths.includes(month) && pricing.low_season_price) {
        finalPrice = Number(pricing.low_season_price);
        priceType = 'low_season';
      }

      // Check weekend pricing (overrides if higher)
      if (weekendDays.includes(dayName) && pricing.weekend_price) {
        const weekendPrice = Number(pricing.weekend_price);
        if (weekendPrice > finalPrice) {
          finalPrice = weekendPrice;
          priceType = 'weekend';
        }
      }
    }

    res.success({
      price: finalPrice,
      price_type: priceType,
      date,
      day_name: dayName
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate price for a date range
 */
export const calculatePriceForRange = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      throw ApiError.badRequest('start_date and end_date are required');
    }

    // Get room info
    const room = await Room.findByPk(roomId);
    if (!room) {
      throw ApiError.notFound('Room not found');
    }

    // Get seasonal pricing config
    const pricing = await SeasonalPricing.findOne({
      where: {
        room_id: roomId,
        is_active: true
      }
    });

    const breakdown = [];
    let totalPrice = 0;
    let nights = 0;

    const currentDate = new Date(start_date + 'T00:00:00');
    const endDate = new Date(end_date + 'T00:00:00');

    // Parse arrays once
    const peakMonths = pricing ? parseJsonArray(pricing.peak_season_months) : [];
    const highMonths = pricing ? parseJsonArray(pricing.high_season_months) : [];
    const lowMonths = pricing ? parseJsonArray(pricing.low_season_months) : [];
    const weekendDays = pricing ? parseJsonArray(pricing.weekend_days) : [];

    while (currentDate < endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const month = currentDate.getMonth() + 1;
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

      let price = room.room_price;
      let priceType = 'default';

      if (pricing) {
        price = Number(pricing.base_price) || room.room_price;
        priceType = 'base';

        // Seasonal pricing
        if (peakMonths.includes(month) && pricing.peak_season_price) {
          price = Number(pricing.peak_season_price);
          priceType = 'peak_season';
        } else if (highMonths.includes(month) && pricing.high_season_price) {
          price = Number(pricing.high_season_price);
          priceType = 'high_season';
        } else if (lowMonths.includes(month) && pricing.low_season_price) {
          price = Number(pricing.low_season_price);
          priceType = 'low_season';
        }

        // Weekend pricing
        if (weekendDays.includes(dayName) && pricing.weekend_price) {
          const weekendPrice = Number(pricing.weekend_price);
          if (weekendPrice > price) {
            price = weekendPrice;
            priceType = 'weekend';
          }
        }
      }

      breakdown.push({
        date: dateStr,
        day_name: dayName,
        price,
        price_type: priceType
      });

      totalPrice += price;
      nights++;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.success({
      breakdown,
      summary: {
        total_price: totalPrice,
        nights,
        check_in: start_date,
        check_out: end_date
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create seasonal pricing configuration
 */
export const createSeasonalPricing = async (req, res, next) => {
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
      is_active = true
    } = req.body;

    if (!business_id) {
      throw ApiError.badRequest('business_id is required');
    }

    if (!base_price && base_price !== 0) {
      throw ApiError.badRequest('base_price is required');
    }

    // Verify business exists
    const business = await Business.findByPk(business_id);
    if (!business) {
      throw ApiError.notFound('Business not found');
    }

    // Verify room exists if provided
    if (room_id) {
      const room = await Room.findByPk(room_id);
      if (!room) {
        throw ApiError.notFound('Room not found');
      }
    }

    const pricing = await SeasonalPricing.create({
      id: uuidv4(),
      business_id,
      room_id,
      base_price,
      weekend_price,
      weekend_days: weekend_days ? JSON.stringify(weekend_days) : null,
      peak_season_price,
      peak_season_months: peak_season_months ? JSON.stringify(peak_season_months) : null,
      high_season_price,
      high_season_months: high_season_months ? JSON.stringify(high_season_months) : null,
      low_season_price,
      low_season_months: low_season_months ? JSON.stringify(low_season_months) : null,
      is_active
    });

    res.created(pricing, 'Seasonal pricing created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update seasonal pricing configuration
 */
export const updateSeasonalPricing = async (req, res, next) => {
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
      is_active
    } = req.body;

    const pricing = await SeasonalPricing.findByPk(id);
    if (!pricing) {
      throw ApiError.notFound('Seasonal pricing not found');
    }

    const updates = {};
    if (base_price !== undefined) updates.base_price = base_price;
    if (weekend_price !== undefined) updates.weekend_price = weekend_price;
    if (weekend_days !== undefined) updates.weekend_days = weekend_days ? JSON.stringify(weekend_days) : null;
    if (peak_season_price !== undefined) updates.peak_season_price = peak_season_price;
    if (peak_season_months !== undefined) updates.peak_season_months = peak_season_months ? JSON.stringify(peak_season_months) : null;
    if (high_season_price !== undefined) updates.high_season_price = high_season_price;
    if (high_season_months !== undefined) updates.high_season_months = high_season_months ? JSON.stringify(high_season_months) : null;
    if (low_season_price !== undefined) updates.low_season_price = low_season_price;
    if (low_season_months !== undefined) updates.low_season_months = low_season_months ? JSON.stringify(low_season_months) : null;
    if (is_active !== undefined) updates.is_active = is_active;

    await pricing.update(updates);

    res.success(pricing, 'Seasonal pricing updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete seasonal pricing configuration
 */
export const deleteSeasonalPricing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pricing = await SeasonalPricing.findByPk(id);
    if (!pricing) {
      throw ApiError.notFound('Seasonal pricing not found');
    }

    await pricing.destroy();

    res.success(null, 'Seasonal pricing deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upsert seasonal pricing (create or update)
 * If room_id is provided, updates/creates for that room
 * If no room_id, updates/creates business-wide pricing
 */
export const upsertSeasonalPricing = async (req, res, next) => {
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
      is_active = true
    } = req.body;

    if (!business_id) {
      throw ApiError.badRequest('business_id is required');
    }

    // Check if pricing config already exists
    let existingPricing = null;
    if (room_id) {
      existingPricing = await SeasonalPricing.findOne({
        where: { room_id, is_active: true }
      });
    } else {
      existingPricing = await SeasonalPricing.findOne({
        where: { business_id, room_id: null, is_active: true }
      });
    }

    if (existingPricing) {
      // Update existing
      const updates = {};
      if (base_price !== undefined) updates.base_price = base_price;
      if (weekend_price !== undefined) updates.weekend_price = weekend_price;
      if (weekend_days !== undefined) updates.weekend_days = weekend_days ? JSON.stringify(weekend_days) : null;
      if (peak_season_price !== undefined) updates.peak_season_price = peak_season_price;
      if (peak_season_months !== undefined) updates.peak_season_months = peak_season_months ? JSON.stringify(peak_season_months) : null;
      if (high_season_price !== undefined) updates.high_season_price = high_season_price;
      if (high_season_months !== undefined) updates.high_season_months = high_season_months ? JSON.stringify(high_season_months) : null;
      if (low_season_price !== undefined) updates.low_season_price = low_season_price;
      if (low_season_months !== undefined) updates.low_season_months = low_season_months ? JSON.stringify(low_season_months) : null;
      if (is_active !== undefined) updates.is_active = is_active;

      await existingPricing.update(updates);
      res.success(existingPricing, 'Seasonal pricing updated successfully');
    } else {
      // Create new
      const pricing = await SeasonalPricing.create({
        id: uuidv4(),
        business_id,
        room_id,
        base_price,
        weekend_price,
        weekend_days: weekend_days ? JSON.stringify(weekend_days) : null,
        peak_season_price,
        peak_season_months: peak_season_months ? JSON.stringify(peak_season_months) : null,
        high_season_price,
        high_season_months: high_season_months ? JSON.stringify(high_season_months) : null,
        low_season_price,
        low_season_months: low_season_months ? JSON.stringify(low_season_months) : null,
        is_active
      });
      res.created(pricing, 'Seasonal pricing created successfully');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Parse JSON array field (handles both string and array)
 */
function parseJsonArray(field) {
  if (!field) return [];
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(field) ? field : [];
}
