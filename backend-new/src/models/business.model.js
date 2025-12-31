/**
 * Business Model
 * Accommodation, restaurant, shop, and service business information
 */
export default (sequelize, DataTypes) => {
  const Business = sequelize.define('Business', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Business name is required' },
        len: { args: [2, 50], msg: 'Business name must be between 2 and 50 characters' }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    min_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'Minimum price cannot be negative' }
      }
    },
    max_price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'Maximum price cannot be negative' }
      }
    },
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: {
        msg: 'Business email already in use'
      },
      validate: {
        isEmail: { msg: 'Must be a valid email address' }
      }
    },
    phone_number: {
      type: DataTypes.STRING(14),
      allowNull: false,
      unique: {
        msg: 'Phone number already in use'
      }
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Address is required' }
      }
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Active', 'Inactive', 'Maintenance', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending'
    },
    business_image: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL to business profile image'
    },
    latitude: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    longitude: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    website_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: { msg: 'Must be a valid URL' }
      }
    },
    facebook_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    instagram_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Business capabilities
    has_booking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Can manage room bookings'
    },
    has_store: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Can sell products'
    },
    has_services: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Can offer services'
    },
    // Foreign keys
    owner_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'owner',
        key: 'id'
      }
    },
    barangay_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'barangay',
        key: 'id'
      }
    }
  }, {
    tableName: 'business',
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft deletes
    indexes: [
      { fields: ['business_name'] },
      { fields: ['status'] },
      { fields: ['owner_id'] },
      { fields: ['email'], unique: true },
      { fields: ['phone_number'], unique: true },
      { fields: ['has_booking'] },
      { fields: ['has_store'] }
    ]
  });

  Business.associate = (models) => {
    Business.belongsTo(models.Owner, {
      foreignKey: 'owner_id',
      as: 'owner'
    });

    Business.belongsTo(models.Barangay, {
      foreignKey: 'barangay_id',
      as: 'barangay'
    });

    Business.hasMany(models.Room, {
      foreignKey: 'business_id',
      as: 'rooms'
    });

    Business.belongsToMany(models.Amenity, {
      through: 'business_amenity',
      foreignKey: 'business_id',
      otherKey: 'amenity_id',
      as: 'amenities'
    });
  };

  return Business;
};
