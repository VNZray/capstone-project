'use strict';

/**
 * Tourist Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tourist', {
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
      ethnicity: {
        type: Sequelize.ENUM('Bicolano', 'Non-Bicolano', 'Foreigner'),
        allowNull: false
      },
      birthdate: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      gender: {
        type: Sequelize.ENUM('Male', 'Female', 'Prefer not to say'),
        allowNull: false
      },
      nationality: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      origin: {
        type: Sequelize.ENUM('Domestic', 'Local', 'Overseas'),
        allowNull: false
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

    console.log('Tourist table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('tourist');
  }
};
