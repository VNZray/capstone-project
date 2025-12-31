'use strict';

/**
 * Service Management Tables Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create service_category table
    await queryInterface.createTable('service_category', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      icon: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create service table
    await queryInterface.createTable('service', {
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
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'service_category',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      image_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Add indexes
    await queryInterface.addIndex('service', ['business_id'], { name: 'idx_service_business' });
    await queryInterface.addIndex('service', ['category_id'], { name: 'idx_service_category' });

    // Note: Stored procedures are now managed separately in src/procedures/serviceProcedures.js

    console.log('Service management tables created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/serviceProcedures.js

    // Drop tables
    await queryInterface.dropTable('service');
    await queryInterface.dropTable('service_category');
  }
};
