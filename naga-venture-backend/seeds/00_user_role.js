/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex("user_role").del();
  await knex("tourist").del();
  await knex("tourism").del();
  await knex("owner").del();
  await knex("user").del();
  await knex("business").del();
  await knex("barangay").del();
  await knex("municipality").del();
  await knex("province").del();
  await knex("address").del();
  await knex("category").del();
  await knex("type").del();

  // Inserts seed entries
  await knex("user_role").insert([
    { id: 1, role_name: "Admin", description: "Tourism Officer" },
    { id: 2, role_name: "Tourist", description: "Regular User" },
    { id: 3, role_name: "Owner", description: "Business Owner" },
  ]);
}
