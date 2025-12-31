/**
 * Tourist Model
 * Tourist profile information
 */
export default (sequelize, DataTypes) => {
  const Tourist = sequelize.define('Tourist', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    first_name: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'First name is required' },
        len: { args: [2, 25], msg: 'First name must be between 2 and 25 characters' }
      }
    },
    last_name: {
      type: DataTypes.STRING(25),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Last name is required' },
        len: { args: [2, 25], msg: 'Last name must be between 2 and 25 characters' }
      }
    },
    middle_name: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    suffix: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: true
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'Filipino'
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'User preferences for recommendations'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    tableName: 'tourist',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'], unique: true },
      { fields: ['last_name', 'first_name'] }
    ]
  });

  // Virtual for full name
  Tourist.prototype.getFullName = function() {
    const parts = [this.first_name];
    if (this.middle_name) parts.push(this.middle_name);
    parts.push(this.last_name);
    if (this.suffix) parts.push(this.suffix);
    return parts.join(' ');
  };

  Tourist.associate = (models) => {
    Tourist.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    Tourist.hasMany(models.Booking, {
      foreignKey: 'tourist_id',
      as: 'bookings'
    });
  };

  return Tourist;
};
