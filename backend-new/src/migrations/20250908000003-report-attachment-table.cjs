'use strict';

/**
 * Report Attachment Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('report_attachment', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      report_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'report',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      file_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      uploaded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    console.log('Report attachment table created.');
  },

  async down(queryInterface) {
    await queryInterface.dropTable('report_attachment');
  }
};
