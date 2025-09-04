/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("tourist_spot_categories").del();
  await knex("tourist_spots").del();

  // Insert tourist spots first
  const spots = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: "Naga Metropolitan Cathedral",
      description: "The Naga Metropolitan Cathedral",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 1,
      latitude: 13.6218,
      longitude: 123.1948,
      contact_phone: "+63 54 473 2175",
      contact_email: "cathedral@nagacity.gov.ph",
      website: "https://nagacathedral.org",
      entry_fee: null,
      spot_status: "active",
      is_featured: true,
      type_id: 4
    }
  ];

  await knex("tourist_spots").insert(spots);

  // Now insert the categories for each tourist spot
  const touristSpotCategories = [
    { id: knex.raw('UUID()'), tourist_spot_id: '550e8400-e29b-41d4-a716-446655440001', category_id: 9 },
    { id: knex.raw('UUID()'), tourist_spot_id: '550e8400-e29b-41d4-a716-446655440001', category_id: 7 }
  ];

  await knex("tourist_spot_categories").insert(touristSpotCategories);
}
