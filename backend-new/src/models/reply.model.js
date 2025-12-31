/**
 * Reply Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Reply = sequelize.define('Reply', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    review_and_rating_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    responder_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'reply',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  Reply.associate = (models) => {
    Reply.belongsTo(models.ReviewAndRating, {
      foreignKey: 'review_and_rating_id',
      as: 'review'
    });
  };

  return Reply;
};
