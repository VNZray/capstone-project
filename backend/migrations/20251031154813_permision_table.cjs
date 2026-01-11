
const { createPermissionProcedures, dropPermissionProcedures } = require("../procedures/auth/permission.procedures.cjs");

exports.up = async function(knex) {
  // Create permission_categories table first
  await knex.schema.createTable("permission_categories", (table) => {
    table.increments("id").primary();
    table.string("name", 50).notNullable().unique();
    table.string("description", 255).nullable();
    table.enum('portal', ['business', 'tourism', 'shared'])
      .notNullable()
      .defaultTo('shared')
      .comment('Which portal this category belongs to: business, tourism, or shared');
    table.integer("sort_order").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.index('portal', 'idx_permission_categories_portal');
  });

  // Create permissions table with category reference and scope
  await knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable(); // manage_bookings, manage_users, manage_rooms, etc.
    table.string('description'); // description of the permission
    table.integer("category_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("permission_categories")
      .onDelete("SET NULL");
    table.enum("scope", ["system", "business", "all"]).notNullable().defaultTo("all");

    table.index(["category_id"], "idx_permission_category");
    table.index(["scope"], "idx_permission_scope");
  });

  // Add FK constraint to user_permissions table (created in user_table migration)
  const hasUserPermissions = await knex.schema.hasTable("user_permissions");
  if (hasUserPermissions) {
    await knex.schema.alterTable("user_permissions", (table) => {
      table
        .foreign("permission_id")
        .references("id")
        .inTable("permissions")
        .onDelete("CASCADE");
    });
  }

  // Create CRUD stored procedures for permissions
  await createPermissionProcedures(knex);

  console.log('Permission categories, permissions table and procedures created.');
};

exports.down = async function(knex) {
  await dropPermissionProcedures(knex);
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists("permission_categories");
};
