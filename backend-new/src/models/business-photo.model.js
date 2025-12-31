/**
 * Business Photo Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const BusinessPhoto = sequelize.define('BusinessPhoto', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    photo_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    caption: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'business_photo',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  BusinessPhoto.associate = (models) => {
    BusinessPhoto.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
  };

  return BusinessPhoto;
};
