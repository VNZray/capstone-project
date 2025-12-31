'use strict';

/**
 * Add missing columns to user table
 * These columns are defined in the User model but were missing from the original migration
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper to safely add column (ignore if exists)
    const safeAddColumn = async (table, column, definition) => {
      try {
        await queryInterface.addColumn(table, column, definition);
        console.log(`[Migration] Added column ${column} to ${table}`);
      } catch (e) {
        if (e.original?.code === 'ER_DUP_FIELDNAME') {
          console.log(`[Migration] Column ${column} already exists in ${table}, skipping`);
        } else {
          throw e;
        }
      }
    };

    // Add otp_expires_at column
    await safeAddColumn('user', 'otp_expires_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add password_changed_at column
    await safeAddColumn('user', 'password_changed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add failed_login_attempts column
    await safeAddColumn('user', 'failed_login_attempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    // Add locked_until column
    await safeAddColumn('user', 'locked_until', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add must_change_password column
    await safeAddColumn('user', 'must_change_password', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    // Add profile_completed column
    await safeAddColumn('user', 'profile_completed', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });

    // Add invitation_token column
    await safeAddColumn('user', 'invitation_token', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true
    });

    // Add invitation_expires_at column
    await safeAddColumn('user', 'invitation_expires_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Add updated_at column if it doesn't exist
    await safeAddColumn('user', 'updated_at', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    console.log('[Migration] Completed adding missing columns to user table');
  },

  async down(queryInterface) {
    const safeRemoveColumn = async (table, column) => {
      try {
        await queryInterface.removeColumn(table, column);
      } catch (e) {
        console.log(`[Migration] Could not remove ${column}, may not exist`);
      }
    };

    await safeRemoveColumn('user', 'otp_expires_at');
    await safeRemoveColumn('user', 'password_changed_at');
    await safeRemoveColumn('user', 'failed_login_attempts');
    await safeRemoveColumn('user', 'locked_until');
    await safeRemoveColumn('user', 'must_change_password');
    await safeRemoveColumn('user', 'profile_completed');
    await safeRemoveColumn('user', 'invitation_token');
    await safeRemoveColumn('user', 'invitation_expires_at');
    await safeRemoveColumn('user', 'updated_at');
  }
};
