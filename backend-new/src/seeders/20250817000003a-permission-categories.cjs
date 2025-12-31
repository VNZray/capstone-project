'use strict';

/**
 * Permission Categories Seeder
 *
 * Seeds permission categories for organizing permissions in the UI.
 */
module.exports = {
  async up(queryInterface) {
    // Check if table exists
    try {
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
        { id: 10, name: 'System Administration', description: 'Platform-wide administrative permissions', sort_order: 100 }
      ];

      await queryInterface.bulkInsert('permission_categories', categories);
      console.log('[Seed] Permission categories seeded.');
    } catch (error) {
      console.log('[Seed] permission_categories table may not exist yet, skipping...');
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('permission_categories', null, {});
  }
};
