'use strict';

/**
 * Notification Preferences & Push Token Storage Migration
 * Matches old backend structure exactly
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create notification_preferences table
    await queryInterface.createTable('notification_preferences', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      // Push notification preferences
      push_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      push_bookings: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      push_orders: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      push_payments: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      push_promotions: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // Email notification preferences
      email_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      email_bookings: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      email_orders: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      email_payments: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // SMS notification preferences
      sms_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sms_bookings: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sms_payments: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create push_tokens table
    await queryInterface.createTable('push_tokens', {
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
      token: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      device_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      platform: {
        type: Sequelize.ENUM('ios', 'android', 'web'),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_used_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for push_tokens
    await queryInterface.addIndex('push_tokens', ['user_id', 'token'], {
      name: 'push_tokens_user_token_unique',
      unique: true
    });
    await queryInterface.addIndex('push_tokens', ['user_id'], { name: 'idx_push_tokens_user' });
    await queryInterface.addIndex('push_tokens', ['is_active'], { name: 'idx_push_tokens_active' });

    // Note: Stored procedures are now managed separately in src/procedures/notificationPreferencesProcedures.js

    console.log('Notification preferences and push tokens tables created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/notificationPreferencesProcedures.js

    // Drop tables
    await queryInterface.dropTable('push_tokens');
    await queryInterface.dropTable('notification_preferences');
  }
};
