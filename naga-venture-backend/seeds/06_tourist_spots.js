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
      description: "The Naga Metropolitan Cathedral, also known as Cathedral of St. John the Evangelist, is a beautiful historical church located in the heart of Naga City. Built in the 18th century, it serves as the seat of the Archdiocese of Caceres and is a significant religious landmark in the Bicol region.",
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
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: "Our Lady of Peñafrancia Shrine",
      description: "A sacred pilgrimage site dedicated to Our Lady of Peñafrancia, the patroness of the Bicol Region. The shrine attracts thousands of devotees annually, especially during the Peñafrancia Festival in September. The beautiful basilica houses the miraculous image of the Virgin Mary.",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 19,
      latitude: 13.6156,
      longitude: 123.1820,
      contact_phone: "+63 54 473 2845",
      contact_email: "shrine@penafrancia.org",
      website: "https://penafrancia.org",
      entry_fee: null,
      spot_status: "active",
      is_featured: true,
      type_id: 4
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: "Plaza Rizal Naga",
      description: "The central plaza of Naga City, dedicated to the national hero Dr. Jose Rizal. A popular gathering place for locals and tourists, featuring a monument of Rizal, beautiful landscaping, and surrounded by important government buildings and commercial establishments.",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 11,
      latitude: 13.6190,
      longitude: 123.1950,
      contact_phone: "+63 54 473 1234",
      contact_email: "plaza@nagacity.gov.ph",
      website: "https://nagacity.gov.ph/plaza-rizal",
      entry_fee: null,
      spot_status: "active",
      is_featured: false,
      type_id: 4
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      name: "Naga City Museum",
      description: "A cultural heritage museum showcasing the rich history and culture of Naga City and the Bicol region. Features artifacts, historical documents, artworks, and interactive exhibits that tell the story of the city from pre-colonial times to the present.",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 14,
      latitude: 13.6210,
      longitude: 123.1955,
      contact_phone: "+63 54 473 5678",
      contact_email: "museum@nagacity.gov.ph",
      website: "https://nagacitymuseum.ph",
      entry_fee: 15,
      spot_status: "active",
      is_featured: false,
      type_id: 4
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      name: "Mount Isarog National Park",
      description: "A biodiversity hotspot and protected area featuring the dormant Mount Isarog volcano. The park offers hiking trails, waterfalls, hot springs, and diverse wildlife. Popular for eco-tourism, bird watching, and adventure activities.",
      province_id: 20,
      municipality_id: 28,
      barangay_id: 15,
      latitude: 13.6583,
      longitude: 123.3667,
      contact_phone: "+63 54 477 9876",
      contact_email: "info@mtisarog.gov.ph",
      website: "https://mtisarogpark.ph",
      entry_fee: 75,
      spot_status: "active",
      is_featured: true,
      type_id: 4
    }
  ];

  await knex("tourist_spots").insert(spots);

  // Now insert the categories for each tourist spot
  const touristSpotCategories = [
    // Naga Metropolitan Cathedral - Churches (9) + Historical (7)
    { id: knex.raw('UUID()'), tourist_spot_id: '550e8400-e29b-41d4-a716-446655440001', category_id: 9 },
    { id: knex.raw('UUID()'), tourist_spot_id: '550e8400-e29b-41d4-a716-446655440001', category_id: 7 },
    
    // Our Lady of Peñafrancia Shrine - Churches (9)
    { id: knex.raw('UUID()'), tourist_spot_id: '550e8400-e29b-41d4-a716-446655440002', category_id: 9 },
    
    // Plaza Rizal Naga - Urban Attractions (8) + Historical (7)
    { id: knex.raw('UUID()'), tourist_spot_id: '550e8400-e29b-41d4-a716-446655440003', category_id: 8 },
    { id: knex.raw('UUID()'), tourist_spot_id: '550e8400-e29b-41d4-a716-446655440003', category_id: 7 },
    
    // Naga City Museum - Museums (4)
    { id: knex.raw('UUID()'), tourist_spot_id: '550e8400-e29b-41d4-a716-446655440004', category_id: 4 },
    
    // Mount Isarog National Park - Nature (6)
    { id: knex.raw('UUID()'), tourist_spot_id: '550e8400-e29b-41d4-a716-446655440005', category_id: 6 }
  ];

  await knex("tourist_spot_categories").insert(touristSpotCategories);
}
