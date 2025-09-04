/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("tourist_spots").del();

  // Inserts seed entries for tourist spots
  await knex("tourist_spots").insert([
    {
      id: knex.raw('UUID()'),
      name: "Naga Metropolitan Cathedral",
      description: "The Naga Metropolitan Cathedral, also known as Cathedral of St. John the Evangelist, is a beautiful historical church located in the heart of Naga City. Built in the 18th century, it serves as the seat of the Archdiocese of Caceres and is a significant religious landmark in the Bicol region.",
      province_id: 20, // Camarines Sur
      municipality_id: 24, // Naga City
      barangay_id: 1, // Abella
      latitude: 13.6218,
      longitude: 123.1948,
      contact_phone: "+63 54 473 2175",
      contact_email: "cathedral@nagacity.gov.ph",
      website: "https://nagacathedral.org",
      entry_fee: null,
      spot_status: "active",
      is_featured: true,
      category_id: 9, // Churches
      type_id: 4 // Tourist Spot
    },
    {
      id: knex.raw('UUID()'),
      name: "Our Lady of Peñafrancia Shrine",
      description: "A sacred pilgrimage site dedicated to Our Lady of Peñafrancia, the patroness of the Bicol Region. The shrine attracts thousands of devotees annually, especially during the Peñafrancia Festival in September. The beautiful basilica houses the miraculous image of the Virgin Mary.",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 19, // Peñafrancia
      latitude: 13.6156,
      longitude: 123.1820,
      contact_phone: "+63 54 473 2845",
      contact_email: "shrine@penafrancia.org",
      website: "https://penafrancia.org",
      entry_fee: null,
      spot_status: "active",
      is_featured: true,
      category_id: 9, // Churches
      type_id: 4
    },
    {
      id: knex.raw('UUID()'),
      name: "Plaza Rizal Naga",
      description: "The central plaza of Naga City, dedicated to the national hero Dr. Jose Rizal. A popular gathering place for locals and tourists, featuring a monument of Rizal, beautiful landscaping, and surrounded by important government buildings and commercial establishments.",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 11, // Del Rosario
      latitude: 13.6186,
      longitude: 123.1950,
      contact_phone: "+63 54 473 2200",
      contact_email: "tourism@nagacity.gov.ph",
      website: null,
      entry_fee: null,
      spot_status: "active",
      is_featured: false,
      category_id: 8, // Urban Attractions
      type_id: 4
    },
    {
      id: knex.raw('UUID()'),
      name: "Naga City Museum",
      description: "A comprehensive museum showcasing the history, culture, and development of Naga City and the surrounding region. Features archaeological artifacts, historical documents, traditional crafts, and interactive exhibits about Bicolano heritage.",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 14, // Lerma
      latitude: 13.6210,
      longitude: 123.1955,
      contact_phone: "+63 54 473 5678",
      contact_email: "museum@nagacity.gov.ph",
      website: "https://nagacitymuseum.ph",
      entry_fee: 15.00,
      spot_status: "active",
      is_featured: false,
      category_id: 4, // Museum
      type_id: 4
    },
    {
      id: knex.raw('UUID()'),
      name: "Mount Isarog National Park",
      description: "A biodiversity hotspot and protected area featuring the dormant Mount Isarog volcano. The park offers hiking trails, waterfalls, hot springs, and diverse wildlife. Popular for eco-tourism, bird watching, and adventure activities.",
      province_id: 20,
      municipality_id: 28, // Pili
      barangay_id: 15, // Using available barangay
      latitude: 13.6583,
      longitude: 123.3667,
      contact_phone: "+63 54 477 9876",
      contact_email: "info@mtisarog.gov.ph",
      website: "https://mtisarogpark.ph",
      entry_fee: 75.00,
      spot_status: "active",
      is_featured: true,
      category_id: 6, // Nature
      type_id: 4
    },
    {
      id: knex.raw('UUID()'),
      name: "Panicuason Hot Springs Resort",
      description: "Natural hot springs resort located in the foothills of Mount Isarog. Features several pools with different temperatures, spa services, and accommodation facilities. Perfect for relaxation and therapeutic bathing in mineral-rich waters.",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 18, // Panicuason
      latitude: 13.5890,
      longitude: 123.2456,
      contact_phone: "+63 54 473 4567",
      contact_email: "resort@panicuasonsprings.com",
      website: "https://panicuasonhotsprings.com",
      entry_fee: 150.00,
      spot_status: "active",
      is_featured: false,
      category_id: 6, // Nature
      type_id: 4
    },
    {
      id: knex.raw('UUID()'),
      name: "Malabsay Falls",
      description: "A hidden gem featuring a multi-tiered waterfall surrounded by lush tropical vegetation. The falls cascade into natural pools perfect for swimming. A moderate hike through scenic trails leads to this refreshing natural wonder.",
      province_id: 20,
      municipality_id: 23, // Nabua
      barangay_id: 20, // Using available barangay
      latitude: 13.4123,
      longitude: 123.3789,
      contact_phone: "+63 54 477 1122",
      contact_email: "tourism@nabua.gov.ph",
      website: null,
      entry_fee: 30.00,
      spot_status: "active",
      is_featured: false,
      category_id: 6, // Nature
      type_id: 4
    },
    {
      id: knex.raw('UUID()'),
      name: "Villa Caceres Heritage Monument",
      description: "A historical monument commemorating the Spanish colonial period in the region. The site features preserved colonial architecture, historical markers, and exhibits about the founding of Nueva Caceres (old name of Naga City).",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 7, // Carolina
      latitude: 13.6150,
      longitude: 123.1890,
      contact_phone: "+63 54 473 7890",
      contact_email: "heritage@nagacity.gov.ph",
      website: null,
      entry_fee: 10.00,
      spot_status: "active",
      is_featured: false,
      category_id: 7, // Historical
      type_id: 4
    },
    {
      id: knex.raw('UUID()'),
      name: "Basilica of Our Lady of Peñafrancia",
      description: "The main basilica dedicated to Our Lady of Peñafrancia, featuring beautiful religious architecture and housing the original miraculous image. The basilica is the center of the annual Peñafrancia Festival, one of the largest Marian celebrations in Asia.",
      province_id: 20,
      municipality_id: 24,
      barangay_id: 19, // Peñafrancia
      latitude: 13.6145,
      longitude: 123.1815,
      contact_phone: "+63 54 473 2900",
      contact_email: "basilica@penafrancia.org",
      website: "https://penafranciabasilica.org",
      entry_fee: null,
      spot_status: "active",
      is_featured: true,
      category_id: 9, // Churches
      type_id: 4
    },
  ]);
}
