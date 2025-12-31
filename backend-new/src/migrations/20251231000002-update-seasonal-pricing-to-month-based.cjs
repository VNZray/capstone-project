'use strict';

/**
 * Migration: Update Seasonal Pricing to Month-Based Schema
 *
 * Reverts from date-range based pricing to month-based seasonal pricing
 * with peak/high/low seasons and weekend pricing
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns
    await queryInterface.addColumn('seasonal_pricing', 'business_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'business',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('seasonal_pricing', 'base_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('seasonal_pricing', 'weekend_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('seasonal_pricing', 'weekend_days', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('seasonal_pricing', 'peak_season_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('seasonal_pricing', 'peak_season_months', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('seasonal_pricing', 'high_season_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('seasonal_pricing', 'high_season_months', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('seasonal_pricing', 'low_season_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('seasonal_pricing', 'low_season_months', {
      type: Sequelize.JSON,
      allowNull: true
    });

    // Make room_id nullable (can have business-wide pricing)
    await queryInterface.changeColumn('seasonal_pricing', 'room_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'room',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    // Remove date-range columns (if they exist)
    try {
      await queryInterface.removeColumn('seasonal_pricing', 'name');
    } catch (e) {
      console.log('Column name does not exist, skipping...');
    }

    try {
      await queryInterface.removeColumn('seasonal_pricing', 'start_date');
    } catch (e) {
      console.log('Column start_date does not exist, skipping...');
    }

    try {
      await queryInterface.removeColumn('seasonal_pricing', 'end_date');
    } catch (e) {
      console.log('Column end_date does not exist, skipping...');
    }

    try {
      await queryInterface.removeColumn('seasonal_pricing', 'price_per_night');
    } catch (e) {
      console.log('Column price_per_night does not exist, skipping...');
    }

    try {
      await queryInterface.removeColumn('seasonal_pricing', 'price_per_hour');
    } catch (e) {
      console.log('Column price_per_hour does not exist, skipping...');
    }

    try {
      await queryInterface.removeColumn('seasonal_pricing', 'min_stay_nights');
    } catch (e) {
      console.log('Column min_stay_nights does not exist, skipping...');
    }

    // Add business_id index
    await queryInterface.addIndex('seasonal_pricing', ['business_id'], {
      name: 'idx_seasonal_pricing_business'
    });

    console.log('Seasonal pricing table updated to month-based schema.');
  },

  async down(queryInterface, Sequelize) {
    // Remove new columns
    await queryInterface.removeColumn('seasonal_pricing', 'business_id');
    await queryInterface.removeColumn('seasonal_pricing', 'base_price');
    await queryInterface.removeColumn('seasonal_pricing', 'weekend_price');
    await queryInterface.removeColumn('seasonal_pricing', 'weekend_days');
    await queryInterface.removeColumn('seasonal_pricing', 'peak_season_price');
    await queryInterface.removeColumn('seasonal_pricing', 'peak_season_months');
    await queryInterface.removeColumn('seasonal_pricing', 'high_season_price');
    await queryInterface.removeColumn('seasonal_pricing', 'high_season_months');
    await queryInterface.removeColumn('seasonal_pricing', 'low_season_price');
    await queryInterface.removeColumn('seasonal_pricing', 'low_season_months');

    // Add back date-range columns
    await queryInterface.addColumn('seasonal_pricing', 'name', {
      type: Sequelize.STRING(100),
      allowNull: false
    });

    await queryInterface.addColumn('seasonal_pricing', 'start_date', {
      type: Sequelize.DATEONLY,
      allowNull: false
    });

    await queryInterface.addColumn('seasonal_pricing', 'end_date', {
      type: Sequelize.DATEONLY,
      allowNull: false
    });

    await queryInterface.addColumn('seasonal_pricing', 'price_per_night', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });

    await queryInterface.addColumn('seasonal_pricing', 'price_per_hour', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('seasonal_pricing', 'min_stay_nights', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 1
    });

    // Make room_id required again
    await queryInterface.changeColumn('seasonal_pricing', 'room_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'room',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });
  }
};
