'use strict';

/**
 * Room Photos Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('room_photos', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      room_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'room',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      uploaded_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    console.log('Room photos table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('room_photos');
  }
};
