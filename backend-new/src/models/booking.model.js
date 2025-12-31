/**
 * Booking Model
 * Room reservation and booking information
 */
export default (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    booking_reference: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Human-readable booking reference number'
    },
    check_in_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Must be a valid date' },
        isAfterToday(value) {
          if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
            throw new Error('Check-in date cannot be in the past');
          }
        }
      }
    },
    check_out_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: { msg: 'Must be a valid date' },
        isAfterCheckIn(value) {
          if (this.check_in_date && new Date(value) <= new Date(this.check_in_date)) {
            throw new Error('Check-out date must be after check-in date');
          }
        }
      }
    },
    check_in_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    check_out_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    guest_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: { args: [1], msg: 'At least 1 guest is required' }
      }
    },
    total_nights: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Calculated number of nights'
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Total amount cannot be negative' }
      }
    },
    status: {
      type: DataTypes.ENUM(
        'Pending',
        'Confirmed',
        'CheckedIn',
        'CheckedOut',
        'Cancelled',
        'NoShow',
        'Refunded'
      ),
      allowNull: false,
      defaultValue: 'Pending'
    },
    special_requests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Foreign keys
    tourist_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tourist',
        key: 'id'
      }
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'room',
        key: 'id'
      }
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'business',
        key: 'id'
      }
    }
  }, {
    tableName: 'booking',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['booking_reference'], unique: true },
      { fields: ['tourist_id'] },
      { fields: ['room_id'] },
      { fields: ['business_id'] },
      { fields: ['status'] },
      { fields: ['check_in_date'] },
      { fields: ['check_out_date'] },
      { fields: ['room_id', 'check_in_date', 'check_out_date'] }
    ],
    hooks: {
      beforeCreate: async (booking) => {
        // Calculate total nights
        if (booking.check_in_date && booking.check_out_date) {
          const checkIn = new Date(booking.check_in_date);
          const checkOut = new Date(booking.check_out_date);
          const diffTime = Math.abs(checkOut - checkIn);
          booking.total_nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Generate booking reference if not provided
        if (!booking.booking_reference) {
          const prefix = 'CV';
          const timestamp = Date.now().toString(36).toUpperCase();
          const random = Math.random().toString(36).substring(2, 6).toUpperCase();
          booking.booking_reference = `${prefix}${timestamp}${random}`;
        }
      }
    }
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.Tourist, {
      foreignKey: 'tourist_id',
      as: 'tourist'
    });

    Booking.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });

    Booking.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });

    Booking.hasOne(models.Payment, {
      foreignKey: 'booking_id',
      as: 'payment'
    });
  };

  return Booking;
};
