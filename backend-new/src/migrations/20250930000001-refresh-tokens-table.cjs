'use strict';

/**
 * Refresh Tokens Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
      },
      token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      revoked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      family_id: {
        type: Sequelize.UUID,
        allowNull: false,
        comment: 'Used for rotation groups'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('refresh_tokens', ['token_hash'], { name: 'idx_refresh_tokens_hash' });
    await queryInterface.addIndex('refresh_tokens', ['user_id'], { name: 'idx_refresh_tokens_user' });
    await queryInterface.addIndex('refresh_tokens', ['family_id'], { name: 'idx_refresh_tokens_family' });
    await queryInterface.addIndex('refresh_tokens', ['expires_at'], { name: 'idx_refresh_tokens_expires' });

    // Note: Stored procedures are now managed separately in src/procedures/refreshTokenProcedures.js

    console.log('Refresh tokens table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are now dropped separately via src/procedures/refreshTokenProcedures.js

    // Drop table
    await queryInterface.dropTable('refresh_tokens');
  }
};
