/**
 * RBAC Enhancement Migration
 * 
 * This migration enhances the existing RBAC system to support:
 * - Two-tier role system: System and Business roles
 * - Custom business-specific roles
 * - Permission inheritance tracking via based_on_role_id
 * - Optional permission overrides for fine-grained control
 * 
 * Note: The 'preset' role_type is deprecated and should not be used.
 * 
 * @see docs/RBAC_ENHANCEMENT_GUIDE.md for full documentation
 */

const { createRoleProcedures, dropRoleProcedures } = require("../procedures/auth/roleProcedures.cjs");

exports.up = async function (knex) {
  // 1. Add new columns to user_role table for two-tier RBAC
  await knex.schema.alterTable("user_role", (table) => {
    // Role type: system (platform-wide), business (business-specific). 'preset' is deprecated.
    table.enum("role_type", ["system", "preset", "business"]).notNullable().defaultTo("system");
    
    // Whether this is a custom role created by business owner (vs cloned from preset)
    table.boolean("is_custom").defaultTo(false);
    
    // Reference to the preset role this role was based on (for audit trail)
    table.integer("based_on_role_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("user_role")
      .onDelete("SET NULL");
    
    // Whether this role can be modified (system roles are immutable)
    table.boolean("is_immutable").defaultTo(false);
    
    // Updated timestamp for tracking modifications
    table.timestamp("updated_at").defaultTo(knex.fn.now());
    
    // Indexes for efficient queries
    table.index(["role_for", "role_type"], "idx_role_for_type");
    table.index(["role_type"], "idx_role_type");
    table.index(["based_on_role_id"], "idx_based_on_role");
  });

  // 2. Create permission categories table for better organization
  await knex.schema.createTable("permission_categories", (table) => {
    table.increments("id").primary();
    table.string("name", 50).notNullable().unique();
    table.string("description", 255).nullable();
    table.integer("sort_order").defaultTo(0);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // 3. Add category reference to permissions table
  await knex.schema.alterTable("permissions", (table) => {
    table.integer("category_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("permission_categories")
      .onDelete("SET NULL");
    
    // Scope: what type of role can have this permission
    table.enum("scope", ["system", "business", "all"]).notNullable().defaultTo("all");
    
    table.index(["category_id"], "idx_permission_category");
    table.index(["scope"], "idx_permission_scope");
  });

  // 4. Create role_permission_overrides table for fine-grained control
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

  // 5. Create role audit log for tracking changes
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

  // 6. Create stored procedures for the enhanced RBAC system
  await createRoleProcedures(knex);

  console.log("RBAC Enhancement migration completed - user_role enhanced with three-tier system.");
};

exports.down = async function (knex) {
  // Drop procedures first
  await dropRoleProcedures(knex);

  // Drop new tables
  await knex.schema.dropTableIfExists("role_audit_log");
  await knex.schema.dropTableIfExists("role_permission_overrides");
  
  // Remove columns from permissions table
  await knex.schema.alterTable("permissions", (table) => {
    table.dropIndex(["scope"], "idx_permission_scope");
    table.dropIndex(["category_id"], "idx_permission_category");
    table.dropColumn("scope");
    table.dropColumn("category_id");
  });
  
  await knex.schema.dropTableIfExists("permission_categories");
  
  // Remove columns from user_role table
  await knex.schema.alterTable("user_role", (table) => {
    table.dropIndex(["based_on_role_id"], "idx_based_on_role");
    table.dropIndex(["role_type"], "idx_role_type");
    table.dropIndex(["role_for", "role_type"], "idx_role_for_type");
    table.dropColumn("updated_at");
    table.dropColumn("is_immutable");
    table.dropColumn("based_on_role_id");
    table.dropColumn("is_custom");
    table.dropColumn("role_type");
  });

  console.log("RBAC Enhancement migration rolled back.");
};
