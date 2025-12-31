/**
 * Business Policies Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const BusinessPolicies = sequelize.define('BusinessPolicies', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true
    },
    cancellation_policy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    refund_policy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    house_rules: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    terms_and_conditions: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'business_policies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  BusinessPolicies.associate = (models) => {
    BusinessPolicies.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
  };

  return BusinessPolicies;
};
