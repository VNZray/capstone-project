'use strict';

/**
 * Order Management Tables Migration
 * Matches the old backend structure exactly
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create order table
    await queryInterface.createTable('order', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'business',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      order_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      discount_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'discount',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      pickup_datetime: {
        type: Sequelize.DATE,
        allowNull: false
      },
      special_instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'accepted',
          'preparing',
          'ready_for_pickup',
          'picked_up',
          'cancelled_by_user',
          'cancelled_by_business',
          'failed_payment'
        ),
        allowNull: false,
        defaultValue: 'pending'
      },
      // Customer arrival tracking
      arrival_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: '000000'
      },
      customer_arrived_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Order lifecycle tracking
      confirmed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      preparation_started_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ready_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      picked_up_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Cancellation details
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancellation_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      cancelled_by: {
        type: Sequelize.ENUM('user', 'business', 'system'),
        allowNull: true
      },
      refund_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      no_show: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // Refund tracking - FK constraint added in refund table migration
      refund_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      refund_requested_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Create order_item table (matching old backend)
    await queryInterface.createTable('order_item', {
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
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'product',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      special_requests: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Add indexes (matching old backend)
    await queryInterface.addIndex('order', ['business_id'], { name: 'idx_order_business' });
    await queryInterface.addIndex('order', ['arrival_code'], { name: 'idx_order_arrival_code' });
    await queryInterface.addIndex('order', ['user_id'], { name: 'idx_order_user' });
    await queryInterface.addIndex('order', ['status'], { name: 'idx_order_status' });
    await queryInterface.addIndex('order', ['pickup_datetime'], { name: 'idx_order_pickup' });
    await queryInterface.addIndex('order', ['order_number'], { name: 'idx_order_number' });
    await queryInterface.addIndex('order', ['business_id', 'created_at'], { name: 'idx_order_business_created' });
    await queryInterface.addIndex('order', ['user_id', 'created_at'], { name: 'idx_order_user_created' });
    await queryInterface.addIndex('order_item', ['order_id'], { name: 'idx_order_items_order' });
    await queryInterface.addIndex('order_item', ['product_id'], { name: 'idx_order_items_product' });

    console.log('Order management tables created.');
  },

  async down(queryInterface) {
    // Drop tables
    await queryInterface.dropTable('order_item');
    await queryInterface.dropTable('order');
  }
};
