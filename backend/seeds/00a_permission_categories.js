/**
 * RBAC Enhancement Seed - Permission Categories
 *
 * Seeds permission categories for organizing permissions in the UI.
 * This should run before the main permissions seed if categories are referenced.
 *
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Check if table exists (migration may not have run yet)
  const tableExists = await knex.schema.hasTable('permission_categories');
  if (!tableExists) {
    console.log('[Seed] permission_categories table does not exist yet, skipping...');
    return;
  }

  // Check if portal column exists (migration may not have run yet)
  const hasPortal = await knex.schema.hasColumn('permission_categories', 'portal');

  // Seed permission categories with portal context
  const categories = [
    // ============================================================
    // BUSINESS PORTAL CATEGORIES (shown when user is in business portal)
    // ============================================================
    { id: 1, name: 'Order Management', description: 'Permissions related to managing orders', portal: 'business', sort_order: 1 },
    { id: 2, name: 'Product Management', description: 'Permissions for product catalog operations', portal: 'business', sort_order: 2 },
    { id: 3, name: 'Service Management', description: 'Permissions for service offerings', portal: 'business', sort_order: 3 },
    { id: 4, name: 'Staff Management', description: 'Permissions for managing business staff', portal: 'business', sort_order: 4 },
    { id: 5, name: 'Customer Relations', description: 'Permissions for customer interactions', portal: 'business', sort_order: 5 },
    { id: 6, name: 'Financial', description: 'Permissions for financial operations', portal: 'business', sort_order: 6 },
    { id: 7, name: 'Reporting', description: 'Permissions for reports and analytics', portal: 'business', sort_order: 7 },
    { id: 8, name: 'Settings', description: 'Permissions for business configuration', portal: 'business', sort_order: 8 },
    { id: 9, name: 'Booking Management', description: 'Permissions for accommodation bookings', portal: 'business', sort_order: 9 },

    // ============================================================
    // TOURISM PORTAL CATEGORIES (shown when user is in tourism portal)
    // ============================================================
    { id: 11, name: 'Tourism Staff Management', description: 'Manage tourism office staff and permissions', portal: 'tourism', sort_order: 1 },
    { id: 12, name: 'Tourist Spot Management', description: 'Manage tourist spots and attractions', portal: 'tourism', sort_order: 2 },
    { id: 13, name: 'Event Management', description: 'Manage city events and activities', portal: 'tourism', sort_order: 3 },
    { id: 14, name: 'Business Approval', description: 'Approve/reject business registrations', portal: 'tourism', sort_order: 4 },
    { id: 15, name: 'Content Management', description: 'Manage tourism content and submissions', portal: 'tourism', sort_order: 5 },
    { id: 16, name: 'User Management', description: 'Manage platform users and accounts', portal: 'tourism', sort_order: 6 },
    { id: 17, name: 'Tourism Reporting', description: 'Tourism analytics and platform reports', portal: 'tourism', sort_order: 7 },
    { id: 18, name: 'Tourism Settings', description: 'Tourism office configuration', portal: 'tourism', sort_order: 8 },
    { id: 19, name: 'Emergency Facilities', description: 'Manage emergency facilities and services', portal: 'tourism', sort_order: 9 },

    // ============================================================
    // SHARED CATEGORIES (shown in both portals - system-wide)
    // ============================================================
    { id: 10, name: 'System Administration', description: 'Platform-wide administrative permissions', portal: 'shared', sort_order: 100 },
  ];

  // Build insert data with optional portal column
  const insertData = categories.map(cat => {
    const record = {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      sort_order: cat.sort_order
    };
    if (hasPortal) {
      record.portal = cat.portal;
    }
    return record;
  });

  await knex('permission_categories')
    .insert(insertData)
    .onConflict('id')
    .merge(hasPortal
      ? ['name', 'description', 'sort_order', 'portal']
      : ['name', 'description', 'sort_order']
    );

  console.log('[Seed] Permission categories seeded successfully.');
}
