/**
 * Refresh Token Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    token_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    family_id: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Used for rotation groups'
    }
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  /**
   * Check if token is valid
   */
  RefreshToken.prototype.isValid = function() {
    if (this.revoked) return false;
    return new Date() < new Date(this.expires_at);
  };

  /**
   * Revoke the token
   */
  RefreshToken.prototype.revoke = async function() {
    this.revoked = true;
    await this.save();
    return this;
  };

  return RefreshToken;
};
