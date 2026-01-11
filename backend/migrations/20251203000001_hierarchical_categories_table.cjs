/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const {
  createProcedures: createCategoryProcedures,
  dropProcedures: dropCategoryProcedures,
} = require("../procedures/category/hierarchical-category.procedures.cjs");

exports.up = async function(knex) {
  // Create hierarchical categories table
  // Note: No 'level' column - tree depth is computed from parent_category chain
  await knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.integer('parent_category').unsigned().nullable()
      .references('id').inTable('categories').onDelete('SET NULL');
    table.string('alias', 100).notNullable().unique();
    table.string('title', 100).notNullable();
    table.text('description').nullable();
    table.enu('applicable_to', ['business', 'tourist_spot', 'event', 'business,tourist_spot', 'business,event', 'tourist_spot,event', 'all'])
      .notNullable().defaultTo('all');
    table.enu('status', ['active', 'inactive']).notNullable().defaultTo('active');
    table.integer('sort_order').unsigned().notNullable().defaultTo(0);
    table.timestamps(true, true);

    // Indexes
    table.index('parent_category', 'idx_categories_parent');
    table.index('status', 'idx_categories_status');
    table.index('sort_order', 'idx_categories_sort');
    table.index('applicable_to', 'idx_categories_applicable');
  });

  // Create entity_categories junction table
  // level: Priority of category for the entity (1=Primary, 2=Secondary, 3=Tertiary)
  // is_primary: Boolean flag for quick primary lookups
  await knex.schema.createTable('entity_categories', (table) => {
    table.increments('id').primary();
    table.uuid('entity_id').notNullable();
    table.enu('entity_type', ['business', 'tourist_spot', 'event']).notNullable();
    table.integer('category_id').unsigned().notNullable()
      .references('id').inTable('categories').onDelete('CASCADE');
    table.integer('level').unsigned().notNullable().defaultTo(1)
      .comment('Priority: 1=primary, 2=secondary, 3=tertiary');
    table.boolean('is_primary').notNullable().defaultTo(false);
    table.timestamps(true, true);

    // Unique constraint: entity can only have each category once
    table.unique(['entity_id', 'entity_type', 'category_id'], {
      indexName: 'idx_entity_category_unique'
    });

    // Indexes
    table.index(['entity_id', 'entity_type'], 'idx_entity_categories_entity');
    table.index('category_id', 'idx_entity_categories_category');
    table.index('is_primary', 'idx_entity_categories_primary');
    table.index('level', 'idx_entity_categories_level');
  });

  // Create stored procedures for hierarchical categories using the procedure file
  await dropCategoryProcedures(knex);
  await createCategoryProcedures(knex);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop procedures using the procedure file
  await dropCategoryProcedures(knex);

  // Drop tables
  await knex.schema.dropTableIfExists('entity_categories');
  await knex.schema.dropTableIfExists('categories');
};
