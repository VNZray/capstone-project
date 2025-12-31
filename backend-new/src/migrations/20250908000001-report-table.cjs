'use strict';

/**
 * Report Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('report', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      reporter_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      target_type: {
        type: Sequelize.ENUM('business', 'event', 'tourist_spot', 'accommodation'),
        allowNull: false
      },
      target_id: {
        type: Sequelize.STRING(64),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('submitted', 'under_review', 'in_progress', 'resolved', 'rejected'),
        allowNull: false,
        defaultValue: 'submitted'
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

    console.log('Report table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('report');
  }
};
