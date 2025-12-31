'use strict';

/**
 * User Roles Seeder
 *
 * Seeds all user roles for the system matching the old backend structure.
 * Role types: System/Government Level, Business Side, Tourist Side
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('user_role', [
      // System / Government Level
      { id: 1, role_name: 'Admin', role_description: 'Full system control; manages all users, roles, and approvals.', role_for: 'Tourism' },
      { id: 2, role_name: 'Tourism Officer', role_description: 'Approves business, event, and tourist spot listings; monitors tourism reports.', role_for: 'Tourism' },
      { id: 3, role_name: 'Event Manager', role_description: 'Manages event listings, participant data, and schedules.', role_for: 'Tourism' },

      // Business Side
      { id: 4, role_name: 'Business Owner', role_description: 'Owner of a business listing; manages all operations and assigns staff roles.', role_for: 'Business' },
      { id: 5, role_name: 'Manager', role_description: 'Handles daily business operations such as bookings, rooms, and transactions.', role_for: 'Business' },
      { id: 6, role_name: 'Room Manager', role_description: 'Responsible for managing room listings, availability, maintenance, and pricing.', role_for: 'Business' },
      { id: 7, role_name: 'Receptionist', role_description: 'Front desk staff responsible for booking confirmation and guest check-ins.', role_for: 'Business' },
      { id: 8, role_name: 'Sales Associate', role_description: 'Manages shop products, prices, and promotions.', role_for: 'Business' },

      // Tourist Side
      { id: 9, role_name: 'Tourist', role_description: 'Regular app user who explores listings, books accommodations, and leaves reviews.', role_for: 'Tourism' }
    ]);

    console.log('[Seed] User roles seeded.');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_role', null, {});
  }
};
