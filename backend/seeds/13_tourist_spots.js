
/**
 * Seed tourist spots with hierarchical categories and images
 * Based on user-provided data with manual image links.
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
      id: "f07f5aae-c4cc-48d1-ae72-7b6495908f6b",
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
      category_aliases: ['churches', 'historical-sites'],
      images: [
        {
          file_url: "https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/touristspots-images/naga-metropolitan-cathedral/imgs/2026-01-06T11-32-58-874Z.jpg",      
          file_format: "jpg",
          file_size: 541210,
          is_primary: 1,
          alt_text: "cathed.jpg"
        }
      ]
    },
    {
      id: "c8631dcc-486c-43fc-bddb-0f17341faa68",
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
      images: [
        {
          file_url: "https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/touristspots-images/our-lady-of-pe-afrancia-basilica-minore/imgs/2026-01-06T11-33-17-012Z.JPG",
          file_format: "JPG",
          file_size: 782473,
          is_primary: 1,
          alt_text: "basi'.JPG"
        }
      ]
    },
    {
      id: "feab5424-9b48-4c15-9694-5b47c53ba092",
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
      images: [
        {
          file_url: "https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/touristspots-images/museo-ni-jesse-robredo/imgs/2026-01-06T11-32-29-893Z.webp",
          file_format: "webp",
          file_size: 108612,
          is_primary: 1,
          alt_text: "jesse.webp"
        }
      ]
    },
    {
      id: "b2ce1404-1390-4ab4-9b6a-005a031aaee7",
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
      images: [
        {
          file_url: "https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/touristspots-images/plaza-rizal-naga/imgs/2026-01-06T11-34-14-199Z.webp",
          file_format: "webp",
          file_size: 371448,
          is_primary: 1,
          alt_text: "plaza-rizal-itpo-scaled.webp"
        }
      ]
    },
    {
      id: "0bb6bb6a-2fed-48a5-bce1-739fbb0eb777",
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
      images: [
        {
          file_url: "https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/touristspots-images/panicuason-hot-spring--naga-side-/imgs/2026-01-06T11-33-56-319Z.webp",
          file_format: "webp",
          file_size: 124284,
          is_primary: 1,
          alt_text: "unnamed.webp"
        }
      ]
    },
  ];

  // 3. Clean up existing data
  await knex('entity_categories').where('entity_type', 'tourist_spot').del();
  await knex('tourist_spot_images').del(); // Clear images
  await knex('tourist_spots').del(); // Clear spots

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

  // 5. Insert Entity Categories and Images
  const entityCategories = [];
  const spotImages = [];

  for (const spot of spots) {
    // Categories
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

    // Images
    if (spot.images && spot.images.length > 0) {
      spot.images.forEach(img => {
        spotImages.push({
          tourist_spot_id: spot.id,
          file_url: img.file_url,
          file_format: img.file_format,
          file_size: img.file_size,
          is_primary: img.is_primary,
          alt_text: img.alt_text
        });
      });
    }
  }

  if (entityCategories.length > 0) {
    await knex('entity_categories').insert(entityCategories);
  }
  
  if (spotImages.length > 0) {
    await knex('tourist_spot_images').insert(spotImages);
  }
  
  console.log(`Seeded ${spots.length} tourist spots with categories and ${spotImages.length} images.`);
}
