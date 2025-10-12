import db from "../db.js";
import { handleDbError } from "../utils/errorHandler.js";

// ==================== BUSINESS SETTINGS ====================

// Get business settings
export async function getBusinessSettings(req, res) {
  const { businessId } = req.params;
  
  try {
    const [data] = await db.query("CALL GetBusinessSettings(?)", [businessId]);
    
    if (!data || data.length === 0) {
      // Return default settings if not found
      return res.json({
        business_id: businessId,
        minimum_preparation_time_minutes: 30,
        order_advance_notice_hours: 0,
        accepts_product_orders: true,
        cancellation_deadline_hours: null,
        cancellation_penalty_percentage: 0,
        cancellation_penalty_fixed: 0,
        allow_customer_cancellation: true,
        auto_confirm_orders: false,
        send_notifications: true
      });
    }
    
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update business settings
export async function upsertBusinessSettings(req, res) {
  const { businessId } = req.params;
  
  try {
    const {
      minimum_preparation_time_minutes,
      order_advance_notice_hours,
      accepts_product_orders,
      cancellation_deadline_hours,
      cancellation_penalty_percentage,
      cancellation_penalty_fixed,
      allow_customer_cancellation,
      auto_confirm_orders,
      send_notifications
    } = req.body;

    const [data] = await db.query(
      "CALL UpsertBusinessSettings(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        businessId,
        minimum_preparation_time_minutes,
        order_advance_notice_hours,
        accepts_product_orders,
        cancellation_deadline_hours,
        cancellation_penalty_percentage,
        cancellation_penalty_fixed,
        allow_customer_cancellation,
        auto_confirm_orders,
        send_notifications
      ]
    );

    res.json({
      message: "Business settings updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}
