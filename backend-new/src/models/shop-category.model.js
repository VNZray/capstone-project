/**
 * Shop Category Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ShopCategory = sequelize.define('ShopCategory', {
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
    category_type: {
      type: DataTypes.ENUM('product', 'service'),
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'shop_category',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ShopCategory.associate = (models) => {
    ShopCategory.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
    ShopCategory.hasMany(models.Product, {
      foreignKey: 'shop_category_id',
      as: 'products'
    });
    ShopCategory.hasMany(models.Service, {
      foreignKey: 'shop_category_id',
      as: 'services'
    });
  };

  return ShopCategory;
};
