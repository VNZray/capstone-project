
const { createRolePermissionProcedures, dropRolePermissionProcedures } = require("../procedures/auth/permissionProcedures.js").default;

exports.up = async function(knex) {
  await knex.schema.createTable('role_permissions', (table) => {
    table.increments('id').primary();
    table.integer('user_role_id').unsigned().notNullable();
    table.integer('permission_id').unsigned().notNullable();
    table
      .foreign('user_role_id')
      .references('id')
      .inTable('user_role')
      .onDelete('CASCADE');
    table
      .foreign('permission_id')
      .references('id')
      .inTable('permissions')
      .onDelete('CASCADE');
    table.unique(['user_role_id', 'permission_id'], 'uq_role_permission');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
  });

  // Create procedures for role-permission assignments
  await createRolePermissionProcedures(knex);
};

exports.down = async function(knex) {
  await dropRolePermissionProcedures(knex);
  await knex.schema.dropTableIfExists('role_permissions');
};