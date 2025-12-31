/**
 * Tourist Spot Image Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const TouristSpotImage = sequelize.define('TouristSpotImage', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    tourist_spot_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    caption: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'tourist_spot_images',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  TouristSpotImage.associate = (models) => {
    TouristSpotImage.belongsTo(models.TouristSpot, {
      foreignKey: 'tourist_spot_id',
      as: 'touristSpot'
    });
  };

  return TouristSpotImage;
};
