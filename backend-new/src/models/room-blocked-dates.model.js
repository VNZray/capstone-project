/**
 * Room Blocked Dates Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const RoomBlockedDates = sequelize.define('RoomBlockedDates', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'room_blocked_dates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  RoomBlockedDates.associate = (models) => {
    RoomBlockedDates.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });
  };

  /**
   * Check if a date range overlaps with this blocked period
   */
  RoomBlockedDates.prototype.overlapsWithRange = function(checkIn, checkOut) {
    return checkIn <= this.end_date && checkOut >= this.start_date;
  };

  return RoomBlockedDates;
};
