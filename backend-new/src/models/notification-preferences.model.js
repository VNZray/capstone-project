/**
 * Notification Preferences Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const NotificationPreferences = sequelize.define('NotificationPreferences', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    push_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    push_bookings: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    push_orders: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    push_payments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    push_promotions: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    email_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    email_bookings: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    email_orders: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    email_payments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sms_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sms_bookings: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sms_payments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    push_token: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Expo push notification token'
    },
    token_platform: {
      type: DataTypes.ENUM('ios', 'android', 'web'),
      allowNull: true
    },
    push_token_updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'notification_preferences',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  NotificationPreferences.associate = (models) => {
    NotificationPreferences.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return NotificationPreferences;
};
