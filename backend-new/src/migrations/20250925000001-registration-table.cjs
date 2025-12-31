'use strict';

/**
 * Registration Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('registration', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      registration_type: {
        type: Sequelize.ENUM('owner', 'tourism'),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      business_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      business_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      business_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      documents: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      reviewed_at: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('registration', ['email'], { name: 'idx_registration_email' });
    await queryInterface.addIndex('registration', ['status'], { name: 'idx_registration_status' });
    await queryInterface.addIndex('registration', ['registration_type'], { name: 'idx_registration_type' });

    // Note: Stored procedures are now managed separately in src/procedures/registrationProcedures.js

    console.log('Registration table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/registrationProcedures.js

    // Drop table
    await queryInterface.dropTable('registration');
  }
};
