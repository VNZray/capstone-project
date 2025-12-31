/**
 * Favorite Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    tourist_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    favorite_type: {
      type: DataTypes.ENUM('accommodation', 'room', 'shop', 'tourist_spot', 'event'),
      allowNull: false
    },
    my_favorite_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'favorite',
    timestamps: false,
    indexes: [
      {
        unique: true,
        name: 'favorite_unique_user_item',
        fields: ['tourist_id', 'favorite_type', 'my_favorite_id']
      }
    ]
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.Tourist, {
      foreignKey: 'tourist_id',
      as: 'tourist'
    });
  };

  return Favorite;
};
