'use strict';

/**
 * Seasonal Pricing Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('seasonal_pricing', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'room',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      price_per_night: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      price_per_hour: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      min_stay_nights: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('seasonal_pricing', ['room_id'], { name: 'idx_seasonal_pricing_room' });
    await queryInterface.addIndex('seasonal_pricing', ['start_date', 'end_date'], { name: 'idx_seasonal_pricing_dates' });

    // Note: Stored procedures are now managed separately in src/procedures/seasonalPricingProcedures.js

    console.log('Seasonal pricing table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/seasonalPricingProcedures.js

    // Drop table
    await queryInterface.dropTable('seasonal_pricing');
  }
};
