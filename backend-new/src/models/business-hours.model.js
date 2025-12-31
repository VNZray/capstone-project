/**
 * Business Hours Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const BusinessHours = sequelize.define('BusinessHours', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    day_of_week: {
      type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      allowNull: false
    },
    open_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    close_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    is_closed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'business_hours',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['business_id', 'day_of_week']
      }
    ]
  });

  BusinessHours.associate = (models) => {
    BusinessHours.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
  };

  return BusinessHours;
};
