'use strict';

/**
 * Service Category Map Table Migration
 * Allows services to be associated with multiple categories
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_category_map', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        primaryKey: true
      },
      service_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'service',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shop_category',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    // Add unique constraint for service-category pair
    await queryInterface.addIndex('service_category_map', ['service_id', 'category_id'], {
      name: 'uq_service_category_map_pair',
      unique: true
    });

    // Add indexes for lookups
    await queryInterface.addIndex('service_category_map', ['category_id'], {
      name: 'idx_service_category_map_category'
    });

    await queryInterface.addIndex('service_category_map', ['service_id'], {
      name: 'idx_service_category_map_service'
    });

    // Note: Backfill is skipped - services use entity_categories for category mapping
    // If legacy shop_category_id exists, run a separate data migration script

    console.log('Service category map table created.');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('service_category_map');
  }
};
