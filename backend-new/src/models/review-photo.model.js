/**
 * Review Photo Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ReviewPhoto = sequelize.define('ReviewPhoto', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    review_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    photo_url: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'review_photos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  ReviewPhoto.associate = (models) => {
    ReviewPhoto.belongsTo(models.ReviewAndRating, {
      foreignKey: 'review_id',
      as: 'review'
    });
  };

  return ReviewPhoto;
};
