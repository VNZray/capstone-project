// seeds/01_category.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Inserts seed entries
  await knex("category").insert([
    { id: 1, category: "Hotel", type_id: 1 },
    { id: 2, category: "Resort", type_id: 1 },
    { id: 3, category: "Restaurant", type_id: 2 },
    { id: 4, category: "Museum", type_id: 4 },
    { id: 5, category: "Coffee Shop", type_id: 2 },
  ]);
}
