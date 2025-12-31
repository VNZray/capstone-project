'use strict';

/**
 * Product Images Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_image', {
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
      image_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('product_image', ['product_id'], { name: 'idx_product_image_product' });

    // Note: Stored procedures are created via procedures/productImagesProcedures.js

    console.log('Product images table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are dropped via procedures/productImagesProcedures.js

    // Drop table
    await queryInterface.dropTable('product_image');
  }
};
