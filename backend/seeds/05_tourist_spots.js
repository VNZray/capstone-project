import { v4 as uuidv4 } from "uuid";

/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {

  const spots = [
    {
      id: uuidv4(),
      name: "Naga Metropolitan Cathedral",
      description:
        "The mother church of the Archdiocese of Caceres, a historic and spiritual landmark in Naga City.",
      barangay_id: 22, // San Francisco
      latitude: 13.6236,
      longitude: 123.1878,
      contact_phone: null,
      contact_email: null,
      website: null,
      entry_fee: null,
      spot_status: "active",
      is_featured: 1, 
      categories: [9, 7], // Churches, Historical
    },
    {
      id: uuidv4(),
      name: "Our Lady of Peñafrancia Basilica Minore",
      description:
        "Home of the miraculous image of Our Lady of Peñafrancia and the culmination site of the annual fluvial procession.",
      barangay_id: 19, // Peñafrancia
      latitude: 13.6108,
      longitude: 123.1943,
      contact_phone: null,
      contact_email: null,
      website: null,
      entry_fee: null,
      spot_status: "active",
      is_featured: 1,
      categories: [9], // Churches
    },
    {
      id: uuidv4(),
      name: "Museo ni Jesse Robredo",
      description:
        "A museum honoring the legacy of former DILG Secretary Jesse M. Robredo, showcasing his life and public service.",
      barangay_id: 26, // Tinago
      latitude: 13.6231,
      longitude: 123.1921,
      contact_phone: null,
      contact_email: null,
      website: null,
      entry_fee: 0.0,
      spot_status: "active",
      is_featured: 0,
      categories: [4, 8], // Museum, Urban Attractions
    },
    {
      id: uuidv4(),
      name: "Plaza Rizal Naga",
      description:
        "A public plaza and popular gathering spot in downtown Naga, featuring the monument of Dr. Jose Rizal.",
      barangay_id: 12, // Dinaga
      latitude: 13.6218,
      longitude: 123.1934,
      contact_phone: null,
      contact_email: null,
      website: null,
      entry_fee: null,
      spot_status: "active",
      is_featured: 0,
      categories: [8, 7], // Urban Attractions, Historical
    },
    {
      id: uuidv4(),
      name: "Panicuason Hot Spring (Naga Side)",
      description:
        "A nature getaway near Mt. Isarog offering hot spring pools and lush surroundings accessible from Naga.",
      barangay_id: 18, // Panicuason
      latitude: 13.6577,
      longitude: 123.3006,
      contact_phone: null,
      contact_email: null,
      website: null,
      entry_fee: null,
      spot_status: "active",
      is_featured: 0,
      categories: [6], // Nature
    },
  ];

  // Insert tourist spots
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
