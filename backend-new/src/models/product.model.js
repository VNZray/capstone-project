/**
 * Product Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    shop_category_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'product',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
    Product.belongsTo(models.ShopCategory, {
      foreignKey: 'shop_category_id',
      as: 'category'
    });
    Product.hasOne(models.ProductStock, {
      foreignKey: 'product_id',
      as: 'stock'
    });
    Product.hasMany(models.OrderItem, {
      foreignKey: 'product_id',
      as: 'orderItems'
    });
  };

  return Product;
};
