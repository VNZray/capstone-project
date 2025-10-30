exports.seed = async function (knex) {
  const table = 'amenity';

  // Insert the minimal 9 amenities; if slugs exist this will fail — consider clearing specific rows first.
  await knex(table).insert([
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
};
