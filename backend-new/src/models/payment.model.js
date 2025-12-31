/**
 * Payment Model
 * Payment transaction records
 */
export default (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    payment_reference: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'External payment gateway reference'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0.01], msg: 'Amount must be greater than 0' }
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'PHP'
    },
    payment_method: {
      type: DataTypes.ENUM('card', 'gcash', 'grab_pay', 'paymaya', 'cash', 'bank_transfer'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'processing',
        'paid',
        'failed',
        'cancelled',
        'refunded',
        'partially_refunded'
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    payment_intent_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'PayMongo payment intent ID'
    },
    checkout_session_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'PayMongo checkout session ID'
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refunded_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    refund_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Additional payment metadata'
    },
    // Foreign keys
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'booking',
        key: 'id'
      }
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'For product orders'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    tableName: 'payment',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['payment_reference'], unique: true },
      { fields: ['booking_id'] },
      { fields: ['order_id'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['payment_intent_id'] },
      { fields: ['checkout_session_id'] }
    ]
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Booking, {
      foreignKey: 'booking_id',
      as: 'booking'
    });

    Payment.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Payment;
};
