/**
 * Discount Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Discount = sequelize.define('Discount', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    discount_type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false
    },
    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    minimum_order: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    maximum_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    usage_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'discount',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Discount.associate = (models) => {
    Discount.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
    Discount.hasMany(models.Order, {
      foreignKey: 'discount_id',
      as: 'orders'
    });
  };

  /**
   * Check if discount is valid for use
   */
  Discount.prototype.isValid = function() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (!this.is_active) return false;
    if (this.start_date && today < this.start_date) return false;
    if (this.end_date && today > this.end_date) return false;
    if (this.usage_limit && this.usage_count >= this.usage_limit) return false;

    return true;
  };

  /**
   * Calculate discount amount
   */
  Discount.prototype.calculateDiscount = function(orderAmount) {
    if (!this.isValid()) return 0;
    if (orderAmount < this.minimum_order) return 0;

    let discountAmount;
    if (this.discount_type === 'percentage') {
      discountAmount = (orderAmount * this.discount_value) / 100;
    } else {
      discountAmount = this.discount_value;
    }

    if (this.maximum_discount && discountAmount > this.maximum_discount) {
      discountAmount = this.maximum_discount;
    }

    return Math.min(discountAmount, orderAmount);
  };

  return Discount;
};
