/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Make this seed idempotent; avoid deleting unrelated tables

  // Check if role_type column exists (migration may not have run yet)
  const hasRoleType = await knex.schema.hasColumn('user_role', 'role_type');

  // Inserts seed entries - System Roles only
  // All roles are now system roles; staff get the generic "Staff" role
  // Business access is determined by staff.business_id, not role_for
  const roles = [
    // System / Government Level
    { 
      id: 1, 
      role_name: "Admin", 
      role_description: "Full system control; manages all users, roles, and approvals.", 
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },
    { 
      id: 2, 
      role_name: "Tourism Officer", 
      role_description: "Approves business, event, and tourist spot listings; monitors tourism reports.",  
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },
    { 
      id: 3, 
      role_name: "Event Manager", 
      role_description: "Manages event listings, participant data, and schedules.",  
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },

    // Business Owner - System Role
    { 
      id: 4, 
      role_name: "Business Owner", 
      role_description: "Owner of a business listing; manages all operations and staff permissions.",  
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },

    // Tourist Side
    { 
      id: 5, 
      role_name: "Tourist", 
      role_description: "Regular app user who explores listings, books accommodations, and leaves reviews.",  
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },

    // Staff - Single role for all staff members
    // Business access determined by staff.business_id, permissions by user_permissions
    { 
      id: 6, 
      role_name: "Staff", 
      role_description: "Staff member of a business. Permissions are assigned per-user.",  
      ...(hasRoleType && { role_type: 'system', is_immutable: true })
    },
  ];

  await knex("user_role").insert(roles)
    .onConflict('id')
    .merge(['role_name', 'role_description', ...(hasRoleType ? ['role_type', 'is_immutable'] : [])]);

  console.log('[Seed] System roles seeded successfully.');
}
