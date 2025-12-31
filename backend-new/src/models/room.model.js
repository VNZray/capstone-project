/**
 * Room Model
 * Accommodation room information
 */
export default (sequelize, DataTypes) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    room_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Room name is required' }
      }
    },
    room_number: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    room_type: {
      type: DataTypes.ENUM('Standard', 'Deluxe', 'Suite', 'Family', 'Single', 'Double', 'Twin'),
      allowNull: false,
      defaultValue: 'Standard'
    },
    max_occupancy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      validate: {
        min: { args: [1], msg: 'Max occupancy must be at least 1' }
      }
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Base price cannot be negative' }
      }
    },
    extra_person_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('Available', 'Occupied', 'Maintenance', 'Unavailable'),
      allowNull: false,
      defaultValue: 'Available'
    },
    floor_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    bed_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    bed_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    bathroom_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    size_sqm: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Room size in square meters'
    },
    room_image: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Primary room image URL'
    },
    // Foreign key
    business_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'business',
        key: 'id'
      }
    }
  }, {
    tableName: 'room',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['business_id'] },
      { fields: ['status'] },
      { fields: ['room_type'] },
      { fields: ['business_id', 'room_number'], unique: true }
    ]
  });

  Room.associate = (models) => {
    Room.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });

    Room.hasMany(models.Booking, {
      foreignKey: 'room_id',
      as: 'bookings'
    });

    Room.belongsToMany(models.Amenity, {
      through: 'room_amenity',
      foreignKey: 'room_id',
      otherKey: 'amenity_id',
      as: 'amenities'
    });
  };

  return Room;
};
