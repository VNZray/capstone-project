'use strict';

/**
 * Notification Table Migration
 * Creates notification table for orders and service bookings
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification', {
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
      notification_type: {
        type: Sequelize.ENUM(
          // Order notifications
          'order_created',
          'order_confirmed',
          'order_preparing',
          'order_ready',
          'order_completed',
          'order_cancelled',
          // Service booking notifications
          'booking_created',
          'booking_confirmed',
          'booking_reminder',
          'booking_in_progress',
          'booking_completed',
          'booking_cancelled',
          'booking_no_show',
          // General
          'payment_received',
          'payment_failed',
          'refund_processed'
        ),
        allowNull: false
      },
      related_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'order_id or service_booking_id'
      },
      related_type: {
        type: Sequelize.ENUM('order', 'service_booking'),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional data (business_name, pickup_time, etc.)'
      },
      is_read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      delivery_method: {
        type: Sequelize.ENUM('push', 'email', 'sms', 'in_app'),
        defaultValue: 'in_app'
      },
      delivery_status: {
        type: Sequelize.ENUM('pending', 'sent', 'failed', 'delivered'),
        defaultValue: 'pending'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      read_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('notification', ['user_id'], { name: 'idx_notification_user' });
    await queryInterface.addIndex('notification', ['related_id', 'related_type'], { name: 'idx_notification_related' });
    await queryInterface.addIndex('notification', ['is_read'], { name: 'idx_notification_read' });
    await queryInterface.addIndex('notification', ['created_at'], { name: 'idx_notification_created' });

    // Note: Stored procedures are now managed separately in src/procedures/notificationProcedures.js

    console.log('Notification table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/notificationProcedures.js

    // Drop table
    await queryInterface.dropTable('notification');
  }
};
