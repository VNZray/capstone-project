'use strict';

/**
 * RBAC Enhancement Seeder
 *
 * Updates existing user roles with role_type, is_custom, and is_immutable fields.
 * Also adds preset roles for businesses to clone.
 */
module.exports = {
  async up(queryInterface) {
    // Check if role_type column exists
    try {
      const [results] = await queryInterface.sequelize.query(
        `SHOW COLUMNS FROM user_role LIKE 'role_type'`
      );

      if (results.length === 0) {
        console.log('[Seed] role_type column does not exist yet, skipping RBAC enhancement...');
        return;
      }

      // Update system roles
      const systemRoles = [
        { id: 1, role_name: 'Admin', role_type: 'system', is_immutable: true, is_custom: false },
        { id: 2, role_name: 'Tourism Officer', role_type: 'system', is_immutable: true, is_custom: false },
        { id: 3, role_name: 'Event Manager', role_type: 'system', is_immutable: true, is_custom: false },
        { id: 4, role_name: 'Business Owner', role_type: 'system', is_immutable: true, is_custom: false },
        { id: 9, role_name: 'Tourist', role_type: 'system', is_immutable: true, is_custom: false }
      ];

      for (const role of systemRoles) {
        await queryInterface.sequelize.query(
          `UPDATE user_role SET role_type = :role_type, is_immutable = :is_immutable, is_custom = :is_custom, role_for = NULL WHERE id = :id`,
          { replacements: role }
        );
      }
      console.log('[Seed] Updated system roles with role_type');

      // Update preset roles (business staff templates)
      const presetRoles = [
        { id: 5, role_name: 'Manager', role_type: 'preset', is_immutable: false, is_custom: false },
        { id: 6, role_name: 'Room Manager', role_type: 'preset', is_immutable: false, is_custom: false },
        { id: 7, role_name: 'Receptionist', role_type: 'preset', is_immutable: false, is_custom: false },
        { id: 8, role_name: 'Sales Associate', role_type: 'preset', is_immutable: false, is_custom: false }
      ];

      for (const role of presetRoles) {
        await queryInterface.sequelize.query(
          `UPDATE user_role SET role_type = :role_type, is_immutable = :is_immutable, is_custom = :is_custom, role_for = NULL WHERE id = :id`,
          { replacements: role }
        );
      }
      console.log('[Seed] Updated business roles to preset templates');

      // Add new preset roles
      const newPresets = [
        { role_name: 'Cook', role_description: 'Kitchen staff responsible for food preparation and order fulfillment.', role_type: 'preset', is_custom: false, is_immutable: false, role_for: null },
        { role_name: 'Housekeeper', role_description: 'Responsible for room cleaning and maintenance tasks.', role_type: 'preset', is_custom: false, is_immutable: false, role_for: null },
        { role_name: 'Cashier', role_description: 'Handles payments, refunds, and cash management.', role_type: 'preset', is_custom: false, is_immutable: false, role_for: null },
        { role_name: 'Tour Guide', role_description: 'Leads tours and assists guests with local information.', role_type: 'preset', is_custom: false, is_immutable: false, role_for: null },
        { role_name: 'Inventory Clerk', role_description: 'Manages product inventory levels and stock updates.', role_type: 'preset', is_custom: false, is_immutable: false, role_for: null }
      ];

      for (const preset of newPresets) {
        // Check if already exists
        const [existing] = await queryInterface.sequelize.query(
          `SELECT id FROM user_role WHERE role_name = :role_name`,
          { replacements: { role_name: preset.role_name } }
        );

        if (existing.length === 0) {
          await queryInterface.bulkInsert('user_role', [preset]);
          console.log(`[Seed] Created new preset role: ${preset.role_name}`);
        }
      }

      console.log('[Seed] RBAC enhancement seed completed.');
    } catch (error) {
      console.log('[Seed] Error during RBAC enhancement:', error.message);
    }
  },

  async down(queryInterface) {
    // This is an update seed, no specific down migration needed
  }
};
