'use strict';

/**
 * Favorite Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('favorite', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      tourist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tourist',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      favorite_type: {
        type: Sequelize.ENUM('accommodation', 'room', 'shop', 'tourist_spot', 'event'),
        allowNull: false
      },
      my_favorite_id: {
        type: Sequelize.UUID,
        allowNull: false
      }
    });

    // Add unique constraint - same as old backend
    await queryInterface.addIndex('favorite', ['tourist_id', 'favorite_type', 'my_favorite_id'], {
      name: 'favorite_unique_user_item',
      unique: true
    });

    // Note: Stored procedures are now managed separately in src/procedures/favoriteProcedures.js

    console.log('Favorite table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/favoriteProcedures.js

    // Drop table
    await queryInterface.dropTable('favorite');
  }
};
