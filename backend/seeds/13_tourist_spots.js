import { v4 as uuidv4 } from "uuid";

/**
 * Seed tourist spots with hierarchical categories
 * Depends on: 08_hierarchical_categories.cjs (for category IDs)
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // 1. Fetch Category Map (Alias -> ID)
  // We need to look up category IDs because they are auto-incremented in 08_hierarchical_categories.cjs
  const categories = await knex('categories').select('id', 'alias');
  const getCatId = (alias) => {
    const cat = categories.find(c => c.alias === alias);
    return cat ? cat.id : null;
  };

  // 2. Define Spots Data
  const spots = [
    {
      id: uuidv4(),
      name: "Naga Metropolitan Cathedral",
      description:
        "The mother church of the Archdiocese of Caceres, a historic and spiritual landmark in Naga City.",
      barangay_id: 22, // San Francisco
      latitude: 13.6236,
      longitude: 123.1878,
      contact_phone: "09613636131",
      contact_email: null,
      website: null,
      entry_fee: null,
      spot_status: "active",
      is_featured: 1, 
      // Map to aliases defined in 08_hierarchical_categories.cjs
      category_aliases: ['churches', 'historical-sites'], 
    },
    {
      id: uuidv4(),
      name: "Our Lady of Peñafrancia Basilica Minore",
      description:
        "Home of the miraculous image of Our Lady of Peñafrancia and the culmination site of the annual fluvial procession.",
      barangay_id: 19, // Peñafrancia
      latitude: 13.6108,
      longitude: 123.1943,
      contact_phone: "09613636132",
      contact_email: null,
      website: null,
      entry_fee: null,
      spot_status: "active",
      is_featured: 1,
      category_aliases: ['churches'],
    },
    {
      id: uuidv4(),
      name: "Museo ni Jesse Robredo",
      description:
        "A museum honoring the legacy of former DILG Secretary Jesse M. Robredo, showcasing his life and public service.",
      barangay_id: 26, // Tinago
      latitude: 13.6231,
      longitude: 123.1921,
      contact_phone: "09613636133",
      contact_email: null,
      website: null,
      entry_fee: 0.0,
      spot_status: "active",
      is_featured: 0,
      category_aliases: ['museums'],
    },
    {
      id: uuidv4(),
      name: "Plaza Rizal Naga",
      description:
        "A public plaza and popular gathering spot in downtown Naga, featuring the monument of Dr. Jose Rizal.",
      barangay_id: 12, // Dinaga
      latitude: 13.6218,
      longitude: 123.1934,
      contact_phone: "09613636134",
      contact_email: null,
      website: null,
      entry_fee: null,
      spot_status: "active",
      is_featured: 0,
      category_aliases: ['parks', 'historical-sites'],
    },
    {
      id: uuidv4(),
      name: "Panicuason Hot Spring (Naga Side)",
      description:
        "A nature getaway near Mt. Isarog offering hot spring pools and lush surroundings accessible from Naga.",
      barangay_id: 18, // Panicuason
      latitude: 13.6577,
      longitude: 123.3006,
      contact_phone: "09613636135",
      contact_email: null,
      website: null,
      entry_fee: null,
      spot_status: "active",
      is_featured: 0,
      category_aliases: ['natural-attractions'],
    },
  ];

  // 3. Clean up existing data
  await knex('entity_categories').where('entity_type', 'tourist_spot').del();
  // Delete tourist spots
  await knex('tourist_spots').del();

  // 4. Insert Tourist Spots
  if (spots.length > 0) {
    await knex("tourist_spots").insert(
      spots.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        barangay_id: s.barangay_id,
        latitude: s.latitude,
        longitude: s.longitude,
        contact_phone: s.contact_phone,
        contact_email: s.contact_email,
        website: s.website,
        entry_fee: s.entry_fee,
        spot_status: s.spot_status,
        is_featured: s.is_featured,
      }))
    );
  }

  // 5. Insert Entity Categories
  const entityCategories = [];
  for (const spot of spots) {
    if (spot.category_aliases && spot.category_aliases.length > 0) {
      spot.category_aliases.forEach((alias, index) => {
        const catId = getCatId(alias);
        if (catId) {
          entityCategories.push({
            entity_id: spot.id,
            entity_type: 'tourist_spot',
            category_id: catId,
            level: index + 1, // 1 = Primary, 2 = Secondary
            is_primary: index === 0
          });
        } else {
          console.warn(`Warning: Category alias '${alias}' not found for spot '${spot.name}'`);
        }
      });
    }
  }

  if (entityCategories.length > 0) {
    await knex('entity_categories').insert(entityCategories);
  }
  
  console.log(`Seeded ${spots.length} tourist spots with categories.`);
}
