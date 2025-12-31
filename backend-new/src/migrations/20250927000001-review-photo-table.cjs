'use strict';

/**
 * Review Photo Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('review_photo', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      review_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'review_and_rating',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      photo_url: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      caption: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index
    await queryInterface.addIndex('review_photo', ['review_id'], { name: 'idx_review_photo_review' });

    // Note: Stored procedures are managed separately in src/procedures/reviewPhotoProcedures.js
    console.log('Review photo table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are managed separately in src/procedures/reviewPhotoProcedures.js
    // Drop table
    await queryInterface.dropTable('review_photo');
  }
};
