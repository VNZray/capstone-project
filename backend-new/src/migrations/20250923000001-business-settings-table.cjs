'use strict';

/**
 * Business Settings Table Migration
 * Business-specific configurations for order/product management
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('business_settings', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'business',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      // Order/Product Settings
      minimum_preparation_time_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        comment: 'Default 30 mins'
      },
      order_advance_notice_hours: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: '0 = can order anytime'
      },
      accepts_product_orders: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // Cancellation Policy
      cancellation_deadline_hours: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'null = no deadline, can cancel anytime'
      },
      cancellation_penalty_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
        comment: '0-100'
      },
      cancellation_penalty_fixed: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      allow_customer_cancellation: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // Operational Settings
      auto_confirm_orders: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Auto-confirm or require manual confirmation'
      },
      send_notifications: {
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

    // Add unique constraint
    await queryInterface.addIndex('business_settings', ['business_id'], {
      name: 'unique_business_settings',
      unique: true
    });

    // Create default settings for existing businesses
    await queryInterface.sequelize.query(`
      INSERT INTO business_settings (id, business_id)
      SELECT UUID(), id FROM business
      WHERE NOT EXISTS (SELECT 1 FROM business_settings WHERE business_settings.business_id = business.id)
    `);

    // Note: Stored procedures are now managed separately in src/procedures/businessSettingsProcedures.js

    console.log('Business settings table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/businessSettingsProcedures.js

    // Drop table
    await queryInterface.dropTable('business_settings');
  }
};
