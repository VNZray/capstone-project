/**
 * Event Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    tourist_spot_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    event_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'cancelled', 'completed'),
      defaultValue: 'draft'
    }
  }, {
    tableName: 'event',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Event.associate = (models) => {
    Event.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
    Event.belongsTo(models.TouristSpot, {
      foreignKey: 'tourist_spot_id',
      as: 'touristSpot'
    });
  };

  return Event;
};
