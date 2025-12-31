'use strict';

/**
 * Amenities Seeder
 *
 * Seeds the amenity table with common amenities matching the old backend structure.
 * Table schema: id, name, slug, icon, is_active
 */
module.exports = {
  async up(queryInterface) {
    // Delete existing amenities to ensure clean seed
    await queryInterface.bulkDelete('amenity', null, {});

    // Insert amenities matching old backend structure
    await queryInterface.bulkInsert('amenity', [
      { name: 'Free Parking', slug: 'free-parking', icon: 'parking', is_active: true },
      { name: 'Free Wi‑Fi', slug: 'free-wifi', icon: 'Wifi', is_active: true },
      { name: 'Credit Card / Cash', slug: 'accepts-cards-cash', icon: 'CreditCard', is_active: true },
      { name: 'Wheelchair Accessible', slug: 'wheelchair-accessible', icon: 'Accessibility', is_active: true },
      { name: 'Restroom', slug: 'restroom', icon: 'DoorOpen', is_active: true },
      { name: 'Air Conditioning', slug: 'air-conditioning', icon: 'AirVent', is_active: true },
      { name: 'Non‑Smoking', slug: 'non-smoking', icon: 'no-CigaretteOff', is_active: true },
      { name: 'Online Food Pickup', slug: 'online-food-pickup', icon: 'ShoppingBag', is_active: true },
      { name: 'Pet Friendly', slug: 'pet-friendly', icon: 'Heart', is_active: true }
    ]);

    console.log('[Seed] Amenities seeded.');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('amenity', null, {});
  }
};
