'use strict';

/**
 * Permit Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permit', {
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
      permit_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      file_format: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'pending'
      },
      submitted_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      expiration_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      }
    });

    console.log('Permit table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('permit');
  }
};
