'use strict';

/**
 * Owner Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('owner', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      first_name: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      middle_name: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      birthdate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('Male', 'Female'),
        allowNull: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    });

    console.log('Owner table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('owner');
  }
};
