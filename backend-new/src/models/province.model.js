/**
 * Province Model
 * Stores province information
 */
export default (sequelize, DataTypes) => {
  const Province = sequelize.define('Province', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Province name is required' }
      }
    }
  }, {
    tableName: 'province',
    timestamps: false
  });

  Province.associate = (models) => {
    Province.hasMany(models.Municipality, {
      foreignKey: 'province_id',
      as: 'municipalities'
    });
  };

  return Province;
};
