/**
 * SeasonalPricing Model
 *
 * Represents seasonal and weekend pricing configurations for rooms
 * Uses month-based seasons (peak, high, low) and weekend day pricing
 */
import { DataTypes, Model } from 'sequelize';

class SeasonalPricing extends Model {
  static associate(models) {
    SeasonalPricing.belongsTo(models.Business, {
      foreignKey: 'business_id',
      as: 'business'
    });
    SeasonalPricing.belongsTo(models.Room, {
      foreignKey: 'room_id',
      as: 'room'
    });
  }
}

export const initSeasonalPricing = (sequelize) => {
  SeasonalPricing.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      business_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'business',
          key: 'id'
        }
      },
      room_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'room',
          key: 'id'
        }
      },
      // Base pricing
      base_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      // Weekend pricing
      weekend_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      weekend_days: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of day names, e.g., ["Friday", "Saturday", "Sunday"]'
      },
      // Peak season (highest demand)
      peak_season_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      peak_season_months: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of month numbers, e.g., [6, 7, 8] for Jun-Aug'
      },
      // High season
      high_season_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      high_season_months: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of month numbers, e.g., [12, 1, 2] for Dec-Feb'
      },
      // Low season
      low_season_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      low_season_months: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of month numbers for off-peak periods'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'SeasonalPricing',
      tableName: 'seasonal_pricing',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  return SeasonalPricing;
};

export default SeasonalPricing;
