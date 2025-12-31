/**
 * Permit Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Permit = sequelize.define('Permit', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    permit_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    permit_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    permit_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    file_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'expired'),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'permit',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Permit.associate = (models) => {
    Permit.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
  };

  /**
   * Check if permit is expired
   */
  Permit.prototype.isExpired = function() {
    if (!this.expiry_date) return false;
    return new Date() > new Date(this.expiry_date);
  };

  return Permit;
};
