'use strict';

/**
 * Payment Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      payer_type: {
        type: Sequelize.ENUM('Tourist', 'Owner'),
        allowNull: false
      },
      payment_type: {
        type: Sequelize.ENUM('Full Payment', 'Partial Payment'),
        allowNull: true
      },
      payment_method: {
        type: Sequelize.ENUM('gcash', 'paymaya', 'card', 'cash_on_pickup'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
      },
      payment_for: {
        type: Sequelize.ENUM('order', 'booking', 'reservation', 'subscription'),
        allowNull: true
      },
      payer_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      payment_for_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      payment_intent_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      payment_method_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      client_key: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      paymongo_payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      refund_reference: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'PHP'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('payment', ['payer_id', 'payment_for_id'], { name: 'idx_payer_paymentfor' });
    await queryInterface.addIndex('payment', ['payment_for_id'], { name: 'idx_payment_for_id' });
    await queryInterface.addIndex('payment', ['payment_intent_id'], { name: 'idx_payment_intent_id' });
    await queryInterface.addIndex('payment', ['payment_method_id'], { name: 'idx_payment_method_id' });
    await queryInterface.addIndex('payment', ['paymongo_payment_id'], { name: 'idx_payment_paymongo_payment_id' });
    await queryInterface.addIndex('payment', ['status'], { name: 'idx_payment_status' });
    await queryInterface.addIndex('payment', ['created_at'], { name: 'idx_payment_created' });

    console.log('Payment table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('payment');
  }
};
