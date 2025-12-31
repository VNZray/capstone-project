/**
 * Business Settings Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const BusinessSettings = sequelize.define('BusinessSettings', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    minimum_preparation_time_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    order_advance_notice_hours: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    accepts_product_orders: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    cancellation_penalty_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00
    },
    cancellation_penalty_fixed: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    allow_customer_cancellation: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    auto_confirm_orders: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    send_notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'business_settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  BusinessSettings.associate = (models) => {
    BusinessSettings.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
  };

  return BusinessSettings;
};
