/**
 * Promotion Model
 */
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Promotion = sequelize.define('Promotion', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    business_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'promotion',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Promotion.associate = (models) => {
    Promotion.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
  };

  /**
   * Check if promotion is currently active
   */
  Promotion.prototype.isCurrentlyActive = function() {
    if (!this.is_active) return false;
    const today = new Date().toISOString().split('T')[0];
    if (this.start_date && today < this.start_date) return false;
    if (this.end_date && today > this.end_date) return false;
    return true;
  };

  return Promotion;
};
