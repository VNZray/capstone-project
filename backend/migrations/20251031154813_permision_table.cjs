
const { createPermissionProcedures, dropPermissionProcedures } = require("../procedures/auth/permissionProcedures.js").default;

exports.up = async function(knex) {
  await knex.schema.createTable('permissions', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable(); // manage_bookings, manage_users, manage_rooms, etc.
    table.string('description'); // description of the permission
  });

  // Create CRUD stored procedures for permissions
  await createPermissionProcedures(knex);

  console.log('Permissions table and procedures created.');
};

exports.down = async function(knex) {
  await dropPermissionProcedures(knex);
  await knex.schema.dropTableIfExists('permissions');
};
