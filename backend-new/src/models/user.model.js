/**
 * User Model
 * Core user authentication and profile data
 */
import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: {
        msg: 'Email address already in use'
      },
      validate: {
        isEmail: { msg: 'Must be a valid email address' },
        notEmpty: { msg: 'Email is required' }
      }
    },
    phone_number: {
      type: DataTypes.STRING(13),
      allowNull: false,
      unique: {
        msg: 'Phone number already in use'
      },
      validate: {
        notEmpty: { msg: 'Phone number is required' }
      }
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: { args: [8, 255], msg: 'Password must be at least 8 characters' }
      }
    },
    user_profile: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'URL to user profile image'
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
      comment: 'One-time password for verification'
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password_changed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Account lockout expiry time'
    },
    user_role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user_role',
        key: 'id'
      }
    },
    barangay_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'barangay',
        key: 'id'
      }
    },
    must_change_password: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Flag for staff onboarding - force password change on first login'
    },
    profile_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether onboarding profile setup is complete'
    },
    invitation_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      comment: 'Token for staff invitation email links'
    },
    invitation_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expiry time for invitation token'
    }
  }, {
    tableName: 'user',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['phone_number'], unique: true },
      { fields: ['user_role_id'] },
      { fields: ['is_active'] },
      { fields: ['is_verified'] }
    ],
    hooks: {
      // Hash password before create
      beforeCreate: async (user) => {
        if (user.password) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      // Hash password before update if changed
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const saltRounds = 12;
          user.password = await bcrypt.hash(user.password, saltRounds);
          user.password_changed_at = new Date();
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password', 'otp', 'otp_expires_at'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      },
      withOtp: {
        attributes: { include: ['otp', 'otp_expires_at'] }
      },
      active: {
        where: { is_active: true, is_verified: true }
      }
    }
  });

  // Instance Methods
  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
  };

  User.prototype.isLocked = function() {
    return this.locked_until && new Date() < new Date(this.locked_until);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.otp;
    delete values.otp_expires_at;
    return values;
  };

  // Associations
  User.associate = (models) => {
    User.belongsTo(models.UserRole, {
      foreignKey: 'user_role_id',
      as: 'role'
    });

    User.hasOne(models.Tourist, {
      foreignKey: 'user_id',
      as: 'tourist'
    });

    User.hasOne(models.Owner, {
      foreignKey: 'user_id',
      as: 'owner'
    });
  };

  return User;
};
