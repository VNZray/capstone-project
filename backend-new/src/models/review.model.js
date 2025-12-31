/**
 * Review and Rating Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ReviewAndRating = sequelize.define('ReviewAndRating', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    review_type: {
      type: DataTypes.ENUM('Accommodation', 'Room', 'Shop', 'Event', 'Tourist Spot', 'Product', 'Service'),
      allowNull: false
    },
    review_type_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tourist_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'review_and_rating',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  ReviewAndRating.associate = (models) => {
    ReviewAndRating.belongsTo(models.Tourist, {
      foreignKey: 'tourist_id',
      as: 'tourist'
    });
    ReviewAndRating.hasMany(models.Reply, {
      foreignKey: 'review_and_rating_id',
      as: 'replies'
    });
    ReviewAndRating.hasMany(models.ReviewPhoto, {
      foreignKey: 'review_id',
      as: 'photos'
    });
  };

  return ReviewAndRating;
};
