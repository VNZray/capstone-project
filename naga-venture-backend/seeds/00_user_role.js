/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // // Deletes ALL existing entries in proper order to respect foreign key constraints
  // // Delete from most dependent to least dependent tables
  // await knex("business").del();           // References: owner, address, business_type, business_category
  // await knex("owner").del();              // References: user, address
  // await knex("tourism").del();            // References: user
  // await knex("tourist").del();            // References: user, address
  // await knex("user").del();               // References: user_role
  await knex("address").del();            // References: province, municipality, barangay
  await knex("tourist_spots").del();      // References: barangay
  await knex("barangay").del();           // References: municipality
  // await knex("municipality").del();       // References: province
  // await knex("province").del();           // No foreign key dependencies
  // await knex("category").del();           // No foreign key dependencies
  // await knex("type").del();               // No foreign key dependencies
  // await knex("user_role").del();          // No foreign key dependencies

  // Inserts seed entries
  await knex("user_role").insert([
    { id: 1, role_name: "Admin", description: "Tourism Officer" },
    { id: 2, role_name: "Tourist", description: "Regular User" },
    { id: 3, role_name: "Owner", description: "Business Owner" },
  ]);
}
