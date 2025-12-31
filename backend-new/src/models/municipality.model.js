/**
 * Municipality Model
 * Stores municipality information linked to province
 */
export default (sequelize, DataTypes) => {
  const Municipality = sequelize.define('Municipality', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    municipality: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Municipality name is required' }
      }
    },
    province_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'municipality',
    timestamps: false
  });

  Municipality.associate = (models) => {
    Municipality.belongsTo(models.Province, {
      foreignKey: 'province_id',
      as: 'province'
    });

    Municipality.hasMany(models.Barangay, {
      foreignKey: 'municipality_id',
      as: 'barangays'
    });
  };

  return Municipality;
};
