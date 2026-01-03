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

  // Seed permission categories
  const categories = [
    { id: 1, name: 'Order Management', description: 'Permissions related to managing orders', sort_order: 1 },
    { id: 2, name: 'Product Management', description: 'Permissions for product catalog operations', sort_order: 2 },
    { id: 3, name: 'Service Management', description: 'Permissions for service offerings', sort_order: 3 },
    { id: 4, name: 'Staff Management', description: 'Permissions for managing business staff', sort_order: 4 },
    { id: 5, name: 'Customer Relations', description: 'Permissions for customer interactions', sort_order: 5 },
    { id: 6, name: 'Financial', description: 'Permissions for financial operations', sort_order: 6 },
    { id: 7, name: 'Reporting', description: 'Permissions for reports and analytics', sort_order: 7 },
    { id: 8, name: 'Settings', description: 'Permissions for business configuration', sort_order: 8 },
    { id: 9, name: 'Booking Management', description: 'Permissions for accommodation bookings', sort_order: 9 },
    { id: 10, name: 'System Administration', description: 'Platform-wide administrative permissions', sort_order: 100 },
  ];

  await knex('permission_categories')
    .insert(categories)
    .onConflict('id')
    .merge(['name', 'description', 'sort_order']);

  console.log('[Seed] Permission categories seeded successfully.');
}
