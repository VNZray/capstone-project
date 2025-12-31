'use strict';

/**
 * Order Audit Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('order_audit', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      order_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'order',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.ENUM('created', 'status_changed', 'payment_updated', 'item_added', 'item_removed', 'cancelled', 'refunded'),
        allowNull: false
      },
      previous_value: {
        type: Sequelize.JSON,
        allowNull: true
      },
      new_value: {
        type: Sequelize.JSON,
        allowNull: true
      },
      performed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('order_audit', ['order_id'], { name: 'idx_order_audit_order' });
    await queryInterface.addIndex('order_audit', ['action'], { name: 'idx_order_audit_action' });

    // Note: Stored procedures are managed separately in src/procedures/orderAuditProcedures.js
    console.log('Order audit table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are managed separately in src/procedures/orderAuditProcedures.js
    // Drop table
    await queryInterface.dropTable('order_audit');
  }
};
