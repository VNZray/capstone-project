/**
 * Service Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Service = sequelize.define('Service', {
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
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    price_type: {
      type: DataTypes.ENUM('per_hour', 'per_day', 'per_week', 'per_month', 'per_session', 'fixed'),
      allowNull: false
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contact_methods: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    contact_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'seasonal'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'service',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Service.associate = (models) => {
    Service.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
    Service.belongsTo(models.ShopCategory, {
      foreignKey: 'shop_category_id',
      as: 'category'
    });
    Service.hasMany(models.ServiceInquiry, {
      foreignKey: 'service_id',
      as: 'inquiries'
    });
  };

  return Service;
};
