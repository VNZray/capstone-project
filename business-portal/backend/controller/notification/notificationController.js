import db from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { handleDbError } from "../../utils/errorHandler.js";

// ==================== NOTIFICATIONS ====================

// Get all notifications for a user
export async function getNotificationsByUserId(req, res) {
  const { userId } = req.params;
  try {
    const [data] = await db.query("CALL GetNotificationsByUserId(?)", [userId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get unread notifications for a user
export async function getUnreadNotificationsByUserId(req, res) {
  const { userId } = req.params;
  try {
    const [data] = await db.query("CALL GetUnreadNotificationsByUserId(?)", [userId]);
    res.json(data);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get notification by ID
export async function getNotificationById(req, res) {
  const { id } = req.params;
  try {
    const [data] = await db.query("CALL GetNotificationById(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Create a new notification
export async function insertNotification(req, res) {
  try {
    const notificationId = uuidv4();
    const {
      user_id,
      notification_type,
      related_id,
      related_type,
      title,
      message,
      metadata,
      delivery_method = "in_app"
    } = req.body;

    const [data] = await db.query(
      "CALL InsertNotification(?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        notificationId,
        user_id,
        notification_type,
        related_id,
        related_type,
        title,
        message,
        metadata ? JSON.stringify(metadata) : null,
        delivery_method
      ]
    );

    res.status(201).json({
      message: "Notification created successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Mark notification as read
export async function markNotificationAsRead(req, res) {
  const { id } = req.params;

  try {
    const [data] = await db.query("CALL MarkNotificationAsRead(?)", [id]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Notification marked as read",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(req, res) {
  const { userId } = req.params;

  try {
    const [data] = await db.query("CALL MarkAllNotificationsAsRead(?)", [userId]);

    res.json({
      message: "All notifications marked as read",
      updated_count: data[0].updated_count
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Update notification delivery status
export async function updateNotificationDeliveryStatus(req, res) {
  const { id } = req.params;
  const { delivery_status } = req.body;

  try {
    const [data] = await db.query("CALL UpdateNotificationDeliveryStatus(?, ?)", [id, delivery_status]);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({
      message: "Delivery status updated successfully",
      data: data[0]
    });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Delete notification
export async function deleteNotification(req, res) {
  const { id } = req.params;

  try {
    await db.query("CALL DeleteNotification(?)", [id]);
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    return handleDbError(error, res);
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(req, res) {
  const { userId } = req.params;

  try {
    const [data] = await db.query("CALL GetUnreadNotificationCount(?)", [userId]);
    res.json(data[0]);
  } catch (error) {
    return handleDbError(error, res);
  }
}
