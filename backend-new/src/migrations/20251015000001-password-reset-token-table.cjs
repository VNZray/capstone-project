'use strict';

/**
 * Password Reset Token Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('password_reset_token', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('(UUID())')
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
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('password_reset_token', ['user_id'], { name: 'idx_password_reset_user' });
    await queryInterface.addIndex('password_reset_token', ['token'], { name: 'idx_password_reset_token' });

    // Note: Stored procedures are managed separately in src/procedures/passwordResetTokenProcedures.js
    console.log('Password reset token table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are managed separately in src/procedures/passwordResetTokenProcedures.js
    // Drop table
    await queryInterface.dropTable('password_reset_token');
  }
};
