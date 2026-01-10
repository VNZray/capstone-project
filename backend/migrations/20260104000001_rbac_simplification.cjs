/**
 * RBAC Simplification Migration
 *
 * This migration updates stored procedures to use the simplified RBAC system:
 *
 * Schema (defined in base migrations):
 * - Simple system roles only: Admin, Tourism Officer, Business Owner, Tourist, Staff
 * - One "Staff" role for ALL staff (business access via staff.business_id)
 * - user_permissions for per-user permissions (staff get individual permissions)
 * - Staff title is just a display field in staff table
 *
 * Note: All table structures are now in base migrations:
 * - user_role (simplified) in user_table migration
 * - user_permissions in user_table migration
 * - staff.title in staff_table migration
 *
 * @see docs/RBAC_SIMPLIFICATION.md for full documentation
 */

const {
  createProcedures: createRbacProcedures,
  dropProcedures: dropRbacProcedures,
} = require("../procedures/auth/rbac-simplification.procedures.cjs");

exports.up = async function (knex) {
  console.log("[RBAC Simplification] Creating simplified stored procedures...");

  // Drop old procedures and create new ones using the procedure file
  await dropRbacProcedures(knex);
  await createRbacProcedures(knex);

  console.log("[RBAC Simplification] Created simplified stored procedures.");
  console.log("[RBAC Simplification] Migration complete!");
};

exports.down = async function (knex) {
  console.log("[RBAC Simplification] Rolling back procedures...");

  // Drop procedures using the procedure file
  await dropRbacProcedures(knex);

  console.log("[RBAC Simplification] Rollback complete.");
};
