/**
 * @param { import("knex").Knex } knex
 */
export async function seed(knex) {
  // Make this seed idempotent; avoid deleting unrelated tables

// Inserts seed entries
await knex("user_role").insert([
  // System / Government Level
  { id: 1, role_name: "Admin", description: "Full system control; manages all users, roles, and approvals." },
  { id: 2, role_name: "Tourism Officer", description: "Approves business, event, and tourist spot listings; monitors tourism reports." },
  { id: 3, role_name: "Event Manager", description: "Manages event listings, participant data, and schedules." },

  // Business Side
  { id: 4, role_name: "Business Owner", description: "Owner of a business listing; manages all operations and assigns staff roles." },
  { id: 5, role_name: "Manager", description: "Handles daily business operations such as bookings, rooms, and transactions." },
  { id: 6, role_name: "Room Manager", description: "Responsible for managing room listings, availability, maintenance, and pricing." },
  { id: 7, role_name: "Receptionist", description: "Front desk staff responsible for booking confirmation and guest check-ins." },
  { id: 8, role_name: "Sales Associate", description: "Manages shop products, prices, and promotions." },

  // Tourist Side
  { id: 9, role_name: "Tourist", description: "Regular app user who explores listings, books accommodations, and leaves reviews." },
])
.onConflict('id')
.merge(['role_name', 'description']);

}
