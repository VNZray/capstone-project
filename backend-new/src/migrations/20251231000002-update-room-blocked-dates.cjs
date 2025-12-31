'use strict';

/**
 * Update Room Blocked Dates Table
 * Adds missing columns: business_id, block_reason, notes, updated_at
 * Renames: reason -> block_reason, blocked_by -> created_by
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper to safely add column (ignore if exists)
    const safeAddColumn = async (table, column, definition) => {
      try {
        await queryInterface.addColumn(table, column, definition);
        console.log(`[Migration] Added column ${column} to ${table}`);
      } catch (e) {
        if (e.original?.code === 'ER_DUP_FIELDNAME' || e.message?.includes('Duplicate column')) {
          console.log(`[Migration] Column ${column} already exists in ${table}, skipping`);
        } else {
          throw e;
        }
      }
    };

    // Helper to safely rename column (ignore if already renamed or doesn't exist)
    const safeRenameColumn = async (table, oldName, newName) => {
      try {
        // First check if the old column exists
        const [columns] = await queryInterface.sequelize.query(
          `SHOW COLUMNS FROM \`${table}\` LIKE '${oldName}'`
        );
        if (columns.length === 0) {
          console.log(`[Migration] Column ${oldName} doesn't exist in ${table} (may already be renamed to ${newName}), skipping`);
          return;
        }
        await queryInterface.renameColumn(table, oldName, newName);
        console.log(`[Migration] Renamed column ${oldName} to ${newName} in ${table}`);
      } catch (e) {
        console.log(`[Migration] Could not rename ${oldName} to ${newName}: ${e.message}, skipping`);
      }
    };

    // Add business_id column
    await safeAddColumn('room_blocked_dates', 'business_id', {
      type: Sequelize.UUID,
      allowNull: true
    });

    // Add notes column
    await safeAddColumn('room_blocked_dates', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add updated_at column
    await safeAddColumn('room_blocked_dates', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    // Rename reason to block_reason
    await safeRenameColumn('room_blocked_dates', 'reason', 'block_reason');

    // Drop the foreign key constraint on blocked_by first
    try {
      await queryInterface.sequelize.query(
        'ALTER TABLE `room_blocked_dates` DROP FOREIGN KEY `room_blocked_dates_ibfk_2`'
      );
      console.log('[Migration] Dropped foreign key room_blocked_dates_ibfk_2');
    } catch (e) {
      // Try alternative constraint name
      try {
        await queryInterface.sequelize.query(
          'ALTER TABLE `room_blocked_dates` DROP FOREIGN KEY `room_blocked_dates_blocked_by_foreign_idx`'
        );
        console.log('[Migration] Dropped foreign key room_blocked_dates_blocked_by_foreign_idx');
      } catch (e2) {
        console.log('[Migration] Foreign key constraint not found or already dropped, continuing...');
      }
    }

    // Rename blocked_by to created_by
    await safeRenameColumn('room_blocked_dates', 'blocked_by', 'created_by');

    // Add index for business_id
    try {
      await queryInterface.addIndex('room_blocked_dates', ['business_id'], {
        name: 'idx_room_blocked_dates_business'
      });
      console.log('[Migration] Added index idx_room_blocked_dates_business');
    } catch (e) {
      console.log('[Migration] Index may already exist, continuing...');
    }

    console.log('[Migration] Room blocked dates table update completed.');
  },

  async down(queryInterface, Sequelize) {
    // Remove index
    try {
      await queryInterface.removeIndex('room_blocked_dates', 'idx_room_blocked_dates_business');
    } catch (e) {
      console.log('[Migration] Index not found, continuing...');
    }

    // Rename back (safe)
    const safeRenameColumn = async (table, oldName, newName) => {
      try {
        await queryInterface.renameColumn(table, oldName, newName);
      } catch (e) {
        console.log(`[Migration] Could not rename ${oldName}, continuing...`);
      }
    };

    await safeRenameColumn('room_blocked_dates', 'block_reason', 'reason');
    await safeRenameColumn('room_blocked_dates', 'created_by', 'blocked_by');

    // Remove columns (safe)
    const safeRemoveColumn = async (table, column) => {
      try {
        await queryInterface.removeColumn(table, column);
      } catch (e) {
        console.log(`[Migration] Could not remove ${column}, continuing...`);
      }
    };

    await safeRemoveColumn('room_blocked_dates', 'updated_at');
    await safeRemoveColumn('room_blocked_dates', 'notes');
    await safeRemoveColumn('room_blocked_dates', 'business_id');

    console.log('[Migration] Room blocked dates table reverted.');
  }
};
