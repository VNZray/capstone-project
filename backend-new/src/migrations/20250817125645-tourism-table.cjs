'use strict';

/**
 * Tourism Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tourism', {
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
      position: {
        type: Sequelize.STRING(20),
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

    console.log('Tourism table created.');
  },

  async down(queryInterface) {
    // Drop table
    await queryInterface.dropTable('tourism');
  }
};
