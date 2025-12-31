/**
 * Staff Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Staff = sequelize.define('Staff', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    middle_name: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    }
  }, {
    tableName: 'staff',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Staff.associate = (models) => {
    Staff.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
    Staff.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  /**
   * Get full name
   */
  Staff.prototype.getFullName = function() {
    const parts = [this.first_name];
    if (this.middle_name) parts.push(this.middle_name);
    parts.push(this.last_name);
    return parts.join(' ');
  };

  return Staff;
};
