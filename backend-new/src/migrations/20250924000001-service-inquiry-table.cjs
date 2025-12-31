'use strict';

/**
 * Service Inquiry Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('service_inquiry', {
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
      service_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'service',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      tourist_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'tourist',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      preferred_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'contacted', 'scheduled', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    await queryInterface.addIndex('service_inquiry', ['business_id'], { name: 'idx_service_inquiry_business' });
    await queryInterface.addIndex('service_inquiry', ['status'], { name: 'idx_service_inquiry_status' });

    console.log('Service inquiry table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('service_inquiry');
  }
};
