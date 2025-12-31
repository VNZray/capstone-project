/**
 * Room Photo Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const RoomPhoto = sequelize.define('RoomPhoto', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    photo_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'room_photos',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  RoomPhoto.associate = (models) => {
    RoomPhoto.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });
  };

  return RoomPhoto;
};
