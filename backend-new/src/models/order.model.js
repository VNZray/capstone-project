/**
 * Order Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    discount_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    pickup_datetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    special_instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(
        'pending', 'accepted', 'preparing', 'ready_for_pickup',
        'picked_up', 'cancelled_by_user', 'cancelled_by_business', 'failed_payment'
      ),
      defaultValue: 'pending'
    },
    arrival_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: '000000'
    },
    customer_arrived_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    preparation_started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ready_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    picked_up_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelled_by: {
      type: DataTypes.ENUM('user', 'business', 'system'),
      allowNull: true
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    no_show: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    refund_id: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Reference to refund record if refund requested'
    },
    refund_requested_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'order',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: (order) => {
        if (!order.order_number) {
          const timestamp = Date.now().toString(36).toUpperCase();
          const random = Math.random().toString(36).substring(2, 6).toUpperCase();
          order.order_number = `ORD-${timestamp}-${random}`;
        }
        if (!order.arrival_code || order.arrival_code === '000000') {
          order.arrival_code = Math.floor(100000 + Math.random() * 900000).toString();
        }
      }
    }
  });

  Order.associate = (models) => {
    Order.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
    Order.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Order.belongsTo(models.Discount, {
      foreignKey: 'discount_id',
      as: 'discount'
    });
    Order.hasMany(models.OrderItem, {
      foreignKey: 'order_id',
      as: 'items'
    });
  };

  return Order;
};
