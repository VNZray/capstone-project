/**
 * External Booking Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ExternalBooking = sequelize.define('ExternalBooking', {
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
      allowNull: false
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'e.g., Booking.com, Airbnb, Walk-in'
    },
    guest_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    check_in: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    check_out: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'external_booking',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ExternalBooking.associate = (models) => {
    ExternalBooking.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });
    ExternalBooking.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
  };

  return ExternalBooking;
};
