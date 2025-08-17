// seeds/01_type.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Inserts seed entries
  await knex("type").insert([
    { id: 1, type: "Accommodation" },
    { id: 2, type: "Shop" },
    { id: 3, type: "Event" },
    { id: 4, type: "Tourist Spot" },
  ]);
}
