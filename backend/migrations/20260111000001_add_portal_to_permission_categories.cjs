/**
 * Migration: Add Portal Context to Permission Categories
 *
 * Adds a 'portal' field to permission_categories table to support context-aware
 * permission organization based on whether user is in business or tourism portal.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('[Migration] Adding portal column to permission_categories...');

  // Add portal enum column to permission_categories
  await knex.schema.alterTable('permission_categories', (table) => {
    table.enum('portal', ['business', 'tourism', 'shared'])
      .notNullable()
      .defaultTo('shared')
      .comment('Which portal this category belongs to: business, tourism, or shared');

    table.index('portal', 'idx_permission_categories_portal');
  });

  console.log('[Migration] ✅ Portal column added to permission_categories');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log('[Migration] Removing portal column from permission_categories...');

  await knex.schema.alterTable('permission_categories', (table) => {
    table.dropIndex('portal', 'idx_permission_categories_portal');
    table.dropColumn('portal');
  });

  console.log('[Migration] ✅ Portal column removed from permission_categories');
};
