/**
 * Tourist Spot Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const TouristSpot = sequelize.define('TouristSpot', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    barangay_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    entry_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    spot_status: {
      type: DataTypes.ENUM('pending', 'active', 'inactive', 'rejected'),
      defaultValue: 'pending'
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'tourist_spots',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  TouristSpot.associate = (models) => {
    TouristSpot.hasMany(models.TouristSpotImage, {
      foreignKey: 'tourist_spot_id',
      as: 'images'
    });
    TouristSpot.hasMany(models.TouristSpotSchedule, {
      foreignKey: 'tourist_spot_id',
      as: 'schedules'
    });
  };

  return TouristSpot;
};
