'use strict';

/**
 * Refund Table Migration
 *
 * Creates a dedicated refund tracking table to support:
 * - Full and partial refunds
 * - Refund history and audit trail
 * - Integration with PayMongo refund API
 * - Support for both orders and bookings
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refund', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      // Polymorphic reference to order or booking
      refund_for: {
        type: Sequelize.ENUM('order', 'booking'),
        allowNull: false
      },
      refund_for_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'order_id or booking_id'
      },
      payment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'payment',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      requested_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      // Refund amounts
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      original_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'PHP'
      },
      // Refund reason
      reason: {
        type: Sequelize.ENUM(
          'requested_by_customer',
          'duplicate',
          'fraudulent',
          'changed_mind',
          'wrong_order',
          'product_unavailable',
          'business_issue',
          'others'
        ),
        allowNull: false,
        defaultValue: 'requested_by_customer'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Optional customer notes'
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Admin/system notes'
      },
      // Refund status tracking
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      // PayMongo integration
      paymongo_refund_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'PayMongo refund ID (ref_...)'
      },
      paymongo_payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Original PayMongo payment ID'
      },
      paymongo_response: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Full PayMongo refund response'
      },
      // Error handling
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      retry_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      // Timestamps
      requested_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When PayMongo processed it'
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When refund was confirmed'
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('refund', ['refund_for_id'], { name: 'idx_refund_for_id' });
    await queryInterface.addIndex('refund', ['payment_id'], { name: 'idx_refund_payment_id' });
    await queryInterface.addIndex('refund', ['requested_by'], { name: 'idx_refund_requested_by' });
    await queryInterface.addIndex('refund', ['paymongo_refund_id'], { name: 'idx_refund_paymongo_id' });
    await queryInterface.addIndex('refund', ['status'], { name: 'idx_refund_status' });
    await queryInterface.addIndex('refund', ['requested_at'], { name: 'idx_refund_requested_at' });
    await queryInterface.addIndex('refund', ['refund_for', 'refund_for_id'], { name: 'idx_refund_for_lookup' });

    // Add FK constraint for order.refund_id now that refund table exists
    await queryInterface.addConstraint('order', {
      fields: ['refund_id'],
      type: 'foreign key',
      name: 'fk_order_refund_id',
      references: {
        table: 'refund',
        field: 'id'
      },
      onDelete: 'SET NULL'
    });

    // Note: Stored procedures are now managed separately in src/procedures/refundProcedures.js

    console.log('Refund table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/refundProcedures.js

    // Remove FK constraint from order table first
    await queryInterface.removeConstraint('order', 'fk_order_refund_id');

    // Drop table
    await queryInterface.dropTable('refund');
  }
};
