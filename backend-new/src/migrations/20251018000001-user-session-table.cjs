'use strict';

/**
 * User Session Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_session', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      session_token: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true
      },
      device_info: {
        type: Sequelize.STRING(255),
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
      last_activity: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('user_session', ['user_id'], { name: 'idx_user_session_user' });
    await queryInterface.addIndex('user_session', ['session_token'], { name: 'idx_user_session_token' });
    await queryInterface.addIndex('user_session', ['expires_at'], { name: 'idx_user_session_expires' });

    // Note: Stored procedures are managed separately in src/procedures/userSessionProcedures.js
    console.log('User session table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are managed separately in src/procedures/userSessionProcedures.js
    // Drop table
    await queryInterface.dropTable('user_session');
  }
};
