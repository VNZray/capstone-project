'use strict';

/**
 * Audit Log Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_log', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      old_values: {
        type: Sequelize.JSON,
        allowNull: true
      },
      new_values: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('audit_log', ['user_id'], { name: 'idx_audit_log_user' });
    await queryInterface.addIndex('audit_log', ['entity_type', 'entity_id'], { name: 'idx_audit_log_entity' });
    await queryInterface.addIndex('audit_log', ['action'], { name: 'idx_audit_log_action' });
    await queryInterface.addIndex('audit_log', ['created_at'], { name: 'idx_audit_log_created' });

    // Note: Stored procedures are created via procedures/auditLogProcedures.js

    console.log('Audit log table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are dropped via procedures/auditLogProcedures.js

    // Drop table
    await queryInterface.dropTable('audit_log');
  }
};
