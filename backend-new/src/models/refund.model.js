/**
 * Refund Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Refund = sequelize.define('Refund', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    refund_for: {
      type: DataTypes.ENUM('order', 'booking'),
      allowNull: false
    },
    refund_for_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'order_id or booking_id'
    },
    payment_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    requested_by: {
      type: DataTypes.UUID,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    original_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'PHP'
    },
    reason: {
      type: DataTypes.ENUM(
        'requested_by_customer', 'duplicate', 'fraudulent', 'changed_mind',
        'wrong_order', 'product_unavailable', 'business_issue', 'others'
      ),
      allowNull: false,
      defaultValue: 'requested_by_customer'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional customer notes'
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Admin/system notes'
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled'),
      defaultValue: 'pending'
    },
    paymongo_refund_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      comment: 'PayMongo refund ID (ref_...)'
    },
    paymongo_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Original PayMongo payment ID'
    },
    paymongo_response: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Full PayMongo refund response'
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When PayMongo processed it'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When refund was confirmed'
    }
  }, {
    tableName: 'refund',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at'
  });

  Refund.associate = (models) => {
    Refund.belongsTo(models.Payment, {
      foreignKey: 'payment_id',
      as: 'payment'
    });
    Refund.belongsTo(models.User, {
      foreignKey: 'requested_by',
      as: 'requester'
    });
  };

  return Refund;
};
