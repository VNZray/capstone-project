/**
 * RBAC Enhancement Migration (DEPRECATED)
 *
 * This migration is now a no-op. All RBAC functionality has been consolidated:
 * - user_role table: in 20250817123940_user_table.cjs
 * - user_permissions table: in 20250817123940_user_table.cjs
 * - RBAC procedures (GetUserPermissions, GrantUserPermission, etc.): in user.procedures.cjs
 * - permission_categories table: in 20251031154813_permision_table.cjs
 *
 * This file is kept to maintain migration history compatibility.
 *
 * @deprecated All functionality moved to user_table migration
 * @see docs/RBAC_SIMPLIFICATION_SUMMARY.md for details
 */

exports.up = async function (knex) {
  console.log("✅ RBAC Enhancement migration (no-op - consolidated into user_table migration)");
};

exports.down = async function (knex) {
  console.log("✅ RBAC Enhancement rollback (no-op)");
};
