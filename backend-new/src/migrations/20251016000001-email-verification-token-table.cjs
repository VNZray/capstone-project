'use strict';

/**
 * Email Verification Token Table Migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_verification_token', {
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
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
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
    await queryInterface.addIndex('email_verification_token', ['user_id'], { name: 'idx_email_verification_user' });
    await queryInterface.addIndex('email_verification_token', ['token'], { name: 'idx_email_verification_token' });
    await queryInterface.addIndex('email_verification_token', ['email'], { name: 'idx_email_verification_email' });

    // Note: Stored procedures are managed separately in src/procedures/emailVerificationTokenProcedures.js
    console.log('Email verification token table created.');
  },

  async down(queryInterface) {
    // Note: Stored procedures are managed separately in src/procedures/emailVerificationTokenProcedures.js
    // Drop table
    await queryInterface.dropTable('email_verification_token');
  }
};
