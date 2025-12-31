/**
 * Product Stock Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ProductStock = sequelize.define('ProductStock', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    current_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    minimum_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    maximum_stock: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    stock_unit: {
      type: DataTypes.ENUM('pieces', 'kg', 'liters', 'grams', 'portions'),
      defaultValue: 'pieces'
    },
    last_restocked_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'product_stock',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at'
  });

  ProductStock.associate = (models) => {
    ProductStock.belongsTo(models.Product, {
      foreignKey: 'product_id',
      as: 'product'
    });
  };

  return ProductStock;
};
