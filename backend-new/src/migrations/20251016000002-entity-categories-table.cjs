'use strict';

/**
 * Entity Categories Table Migration
 * Junction table linking entities (business, tourist_spot, event) to categories
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if entity_categories table already exists
    const [entityTables] = await queryInterface.sequelize.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'entity_categories'"
    );

    if (entityTables.length === 0) {
      // Create entity_categories junction table
      await queryInterface.createTable('entity_categories', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        entity_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        entity_type: {
          type: Sequelize.ENUM('business', 'tourist_spot', 'event'),
          allowNull: false
        },
        category_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'categories',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        level: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 1,
          comment: 'Priority: 1=primary, 2=secondary, 3=tertiary'
        },
        is_primary: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
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

      // Add unique constraint and indexes
      await queryInterface.addIndex('entity_categories', ['entity_id', 'entity_type', 'category_id'], {
        name: 'idx_entity_category_unique',
        unique: true
      });
      await queryInterface.addIndex('entity_categories', ['entity_id', 'entity_type'], { name: 'idx_entity_categories_entity' });
      await queryInterface.addIndex('entity_categories', ['category_id'], { name: 'idx_entity_categories_category' });
      await queryInterface.addIndex('entity_categories', ['is_primary'], { name: 'idx_entity_categories_primary' });
      await queryInterface.addIndex('entity_categories', ['level'], { name: 'idx_entity_categories_level' });
    }

    console.log('Entity categories table created.');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('entity_categories');
  }
};
