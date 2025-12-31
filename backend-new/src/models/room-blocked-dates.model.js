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
    business_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    block_reason: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Other'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'room_blocked_dates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  RoomBlockedDates.associate = (models) => {
    RoomBlockedDates.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });
    RoomBlockedDates.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
    RoomBlockedDates.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'createdByUser'
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
