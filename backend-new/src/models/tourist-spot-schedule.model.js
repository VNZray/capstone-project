/**
 * Tourist Spot Schedule Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const TouristSpotSchedule = sequelize.define('TouristSpotSchedule', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    tourist_spot_id: {
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
    tableName: 'tourist_spot_schedules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  TouristSpotSchedule.associate = (models) => {
    TouristSpotSchedule.belongsTo(models.TouristSpot, {
      foreignKey: 'tourist_spot_id',
      as: 'touristSpot'
    });
  };

  return TouristSpotSchedule;
};
