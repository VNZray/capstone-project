/**
 * Amenity Model
 * Shared amenities for rooms and businesses
 */
export default (sequelize, DataTypes) => {
  const Amenity = sequelize.define('Amenity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Amenity name is required' }
      }
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Icon name or class'
    },
    category: {
      type: DataTypes.ENUM('room', 'business', 'both'),
      allowNull: false,
      defaultValue: 'both',
      comment: 'Where this amenity can be applied'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'amenity',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['name'], unique: true },
      { fields: ['category'] },
      { fields: ['is_active'] }
    ]
  });

  Amenity.associate = (models) => {
    Amenity.belongsToMany(models.Business, {
      through: 'business_amenity',
      foreignKey: 'amenity_id',
      otherKey: 'business_id',
      as: 'businesses'
    });

    Amenity.belongsToMany(models.Room, {
      through: 'room_amenity',
      foreignKey: 'amenity_id',
      otherKey: 'room_id',
      as: 'rooms'
    });
  };

  return Amenity;
};
