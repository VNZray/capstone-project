/**
 * Business Amenity Model (Junction Table)
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const BusinessAmenity = sequelize.define('BusinessAmenity', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    amenity_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'business_amenity',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['business_id', 'amenity_id']
      }
    ]
  });

  BusinessAmenity.associate = (models) => {
    BusinessAmenity.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
    BusinessAmenity.belongsTo(models.Amenity, {
      foreignKey: 'amenity_id',
      as: 'amenity'
    });
  };

  return BusinessAmenity;
};
