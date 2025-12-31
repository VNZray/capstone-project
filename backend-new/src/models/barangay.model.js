/**
 * Barangay Model
 * Stores barangay information linked to municipality
 */
export default (sequelize, DataTypes) => {
  const Barangay = sequelize.define('Barangay', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    barangay: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Barangay name is required' }
      }
    },
    municipality_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'barangay',
    timestamps: false
  });

  Barangay.associate = (models) => {
    Barangay.belongsTo(models.Municipality, {
      foreignKey: 'municipality_id',
      as: 'municipality'
    });

    Barangay.hasMany(models.User, {
      foreignKey: 'barangay_id',
      as: 'users'
    });

    Barangay.hasMany(models.Business, {
      foreignKey: 'barangay_id',
      as: 'businesses'
    });

    Barangay.hasMany(models.TouristSpot, {
      foreignKey: 'barangay_id',
      as: 'touristSpots'
    });
  };

  return Barangay;
};
