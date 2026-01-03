/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Make this seed idempotent; avoid deleting unrelated tables

// Inserts seed entries - Only System Roles
// Business roles are created dynamically by Business Owners and Tourism Officers
await knex("user_role").insert([
  // System / Government Level
  { id: 1, role_name: "Admin", role_description: "Full system control; manages all users, roles, and approvals.", role_for: null },
  { id: 2, role_name: "Tourism Officer", role_description: "Approves business, event, and tourist spot listings; monitors tourism reports.",  role_for: null },
  { id: 3, role_name: "Event Manager", role_description: "Manages event listings, participant data, and schedules.",  role_for: null },

  // Business Owner - System Role (actual business staff roles are custom per-business)
  { id: 4, role_name: "Business Owner", role_description: "Owner of a business listing; manages all operations and creates custom staff roles.",  role_for: null },

  // Tourist Side
  { id: 9, role_name: "Tourist", role_description: "Regular app user who explores listings, books accommodations, and leaves reviews.",  role_for: null },
])
.onConflict('id')
.merge(['role_name', 'role_description', 'role_for']);

}
