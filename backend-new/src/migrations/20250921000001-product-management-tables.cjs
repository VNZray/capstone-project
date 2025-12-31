'use strict';

/**
 * Product Management Tables Migration
 * Creates product, product_stock, and stock_history tables
 *
 * Note: shop_category table should be created by migration 20250920000001-shop-category-table.cjs
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create product table
    await queryInterface.createTable('product', {
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
      shop_category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shop_category',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'out_of_stock'),
        defaultValue: 'active'
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

    // Create product_stock table
    await queryInterface.createTable('product_stock', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'product',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      current_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      minimum_stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      maximum_stock: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      stock_unit: {
        type: Sequelize.ENUM('pieces', 'kg', 'liters', 'grams', 'portions'),
        defaultValue: 'pieces'
      },
      last_restocked_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create stock_history table
    await queryInterface.createTable('stock_history', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
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
      change_type: {
        type: Sequelize.ENUM('restock', 'sale', 'adjustment', 'expired'),
        allowNull: false
      },
      quantity_change: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'positive for additions, negative for reductions'
      },
      previous_stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('product', ['business_id'], { name: 'idx_product_business' });
    await queryInterface.addIndex('product', ['shop_category_id'], { name: 'idx_product_shop_category' });
    await queryInterface.addIndex('product', ['status'], { name: 'idx_product_status' });
    await queryInterface.addIndex('product_stock', ['product_id'], { name: 'unique_product_stock', unique: true });
    await queryInterface.addIndex('stock_history', ['product_id'], { name: 'idx_stock_history_product' });
    await queryInterface.addIndex('stock_history', ['created_at'], { name: 'idx_stock_history_date' });

    console.log('Product management tables created.');
  },

  async down(queryInterface) {
    // Drop tables in reverse order
    await queryInterface.dropTable('stock_history');
    await queryInterface.dropTable('product_stock');
    await queryInterface.dropTable('product');
  }
};
