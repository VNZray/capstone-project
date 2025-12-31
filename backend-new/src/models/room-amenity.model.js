/**
 * Room Amenity Model (Junction Table)
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const RoomAmenity = sequelize.define('RoomAmenity', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    amenity_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'room_amenity',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['room_id', 'amenity_id']
      }
    ]
  });

  RoomAmenity.associate = (models) => {
    RoomAmenity.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });
    RoomAmenity.belongsTo(models.Amenity, {
      foreignKey: 'amenity_id',
      as: 'amenity'
    });
  };

  return RoomAmenity;
};
