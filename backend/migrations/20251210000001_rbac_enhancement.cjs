/**
 * RBAC Enhancement Migration
 *
 * This migration creates additional RBAC tables for fine-grained control:
 * - role_permission_overrides: Allows adding/removing specific permissions from roles
 * - role_audit_log: Tracks changes to roles and permissions
 *
 * @see docs/RBAC_ENHANCEMENT_GUIDE.md for full documentation
 */

const { createRoleProcedures, dropRoleProcedures } = require("../procedures/auth/role.procedures.cjs");
const {
  createProcedures: createRbacProcedures,
  dropProcedures: dropRbacProcedures,
} = require("../procedures/auth/rbac-simplification.procedures.cjs");

exports.up = async function (knex) {
  console.log('Creating RBAC enhancement tables and procedures...');

  // Create role_permission_overrides table for fine-grained control
  // This allows business owners to add/remove specific permissions from preset-based roles
  await knex.schema.createTable("role_permission_overrides", (table) => {
    table.increments("id").primary();

    table.integer("user_role_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("user_role")
      .onDelete("CASCADE");

    table.integer("permission_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("permissions")
      .onDelete("CASCADE");

    // true = grant this permission (add to inherited), false = revoke (remove from inherited)
    table.boolean("is_granted").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.uuid("created_by").nullable();

    // Ensure unique override per role+permission
    table.unique(["user_role_id", "permission_id"], "uq_role_permission_override");
  });

  // Create role audit log for tracking changes
  await knex.schema.createTable("role_audit_log", (table) => {
    table.increments("id").primary();

    table.integer("user_role_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("user_role")
      .onDelete("CASCADE");

    table.enum("action", ["created", "updated", "deleted", "permission_added", "permission_removed", "override_added", "override_removed"]).notNullable();

    table.json("old_values").nullable();
    table.json("new_values").nullable();

    table.uuid("performed_by").nullable();
    table.timestamp("performed_at").defaultTo(knex.fn.now());

    table.index(["user_role_id"], "idx_role_audit_role");
    table.index(["performed_at"], "idx_role_audit_time");
  });

  // Create stored procedures for the enhanced RBAC system
  console.log("Creating RBAC stored procedures...");
  await createRbacProcedures(knex);

  console.log("✅ RBAC Enhancement migration completed.");
};

exports.down = async function (knex) {
  console.log('Dropping RBAC enhancement tables and procedures...');

  // Drop procedures first
  await dropRbacProcedures(knex);

  // Drop new tables
  await knex.schema.dropTableIfExists("role_audit_log");
  await knex.schema.dropTableIfExists("role_permission_overrides");

  console.log("✅ RBAC Enhancement migration rolled back.");
};
