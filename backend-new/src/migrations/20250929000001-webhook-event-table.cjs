'use strict';

/**
 * Webhook Event Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('webhook_event', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      event_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      event_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      source: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'e.g., paymongo, stripe'
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'processed', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('webhook_event', ['event_id'], { name: 'idx_webhook_event_id' });
    await queryInterface.addIndex('webhook_event', ['event_type'], { name: 'idx_webhook_event_type' });
    await queryInterface.addIndex('webhook_event', ['status'], { name: 'idx_webhook_status' });
    await queryInterface.addIndex('webhook_event', ['source'], { name: 'idx_webhook_source' });

    // Note: Stored procedures are managed separately in src/procedures/webhookEventProcedures.js
    console.log('Webhook event table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are managed separately in src/procedures/webhookEventProcedures.js
    // Drop table
    await queryInterface.dropTable('webhook_event');
  }
};
