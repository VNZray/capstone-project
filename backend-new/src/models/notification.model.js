/**
 * Notification Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    notification_type: {
      type: DataTypes.ENUM(
        'order_created', 'order_confirmed', 'order_preparing', 'order_ready',
        'order_completed', 'order_cancelled', 'booking_created', 'booking_confirmed',
        'booking_reminder', 'booking_in_progress', 'booking_completed', 'booking_cancelled',
        'booking_no_show', 'payment_received', 'payment_failed', 'refund_processed'
      ),
      allowNull: false
    },
    related_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    related_type: {
      type: DataTypes.ENUM('order', 'service_booking', 'booking'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    delivery_method: {
      type: DataTypes.ENUM('push', 'email', 'sms', 'in_app'),
      defaultValue: 'in_app'
    },
    delivery_status: {
      type: DataTypes.ENUM('pending', 'sent', 'failed', 'delivered'),
      defaultValue: 'pending'
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'notification',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  /**
   * Mark notification as read
   */
  Notification.prototype.markAsRead = async function() {
    this.is_read = true;
    this.read_at = new Date();
    await this.save();
    return this;
  };

  return Notification;
};
