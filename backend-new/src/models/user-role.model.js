/**
 * UserRole Model
 * Defines user roles (Tourist, Business Owner, Manager, Staff, Tourism Admin)
 */
export default (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Role name is required' },
        len: { args: [2, 20], msg: 'Role name must be between 2 and 20 characters' }
      }
    },
    role_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role_for: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Business ID that created this role (null for system roles)'
    },
    role_for_type: {
      type: DataTypes.ENUM('accommodation', 'tourism', 'shop', 'combined'),
      allowNull: true,
      comment: 'Type of business this role is for'
    },
    role_type: {
      type: DataTypes.ENUM('system', 'custom'),
      defaultValue: 'system',
      comment: 'Whether this is a system or custom role'
    },
    is_custom: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Quick flag to identify custom roles'
    },
    based_on_role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Reference to parent role if this is a custom role'
    },
    is_immutable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Prevent modification of critical system roles'
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of permission strings for this role'
    }
  }, {
    tableName: 'user_role',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['role_name'] },
      { fields: ['role_for'] }
    ]
  });

  UserRole.associate = (models) => {
    UserRole.hasMany(models.User, {
      foreignKey: 'user_role_id',
      as: 'users'
    });
  };

  return UserRole;
};
