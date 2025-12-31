'use strict';

/**
 * Room Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('room', {
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
      room_number: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      room_type: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      room_price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      per_hour_rate: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      room_size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      room_image: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('Available', 'Occupied', 'Maintenance', 'Reserved'),
        allowNull: false
      },
      capacity: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
      }
    });

    console.log('Room table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('room');
  }
};
