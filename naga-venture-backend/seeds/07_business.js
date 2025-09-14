import { v4 as uuidv4 } from "uuid";

/**
 * Seed sample businesses
 * - Creates minimal address rows (nullable in schema)
 * - Ensures an owner exists (uses one from users seed if present, otherwise creates a temp owner)
 * - Inserts 2 example businesses (Accommodation + Restaurant)
 *
 * Requirements from schema (migrations/20250817130104_business_table.cjs):
 *   id (uuid, default) | business_name | email | phone_number | business_type_id | business_category_id
 *   address_id (nullable FK) | address (text) | owner_id (uuid FK) | status | latitude | longitude | hasBooking
 */
export async function seed(knex) {
  // Clean business-related tables that depend on business
  await knex("business_hours").del().catch(() => {});
  await knex("business").del();

  // Require the pre-seeded owner from 06_users.js
  const owner = await knex("owner")
    .first("id", "email")
    .where({ email: "owner@cityventure.test" });
  if (!owner) {
    throw new Error(
      "Seeded owner not found. Please run the users seed (06_users.js) before 07_business.js."
    );
  }

  // Create one minimal address (schema allows nulls for province/municipality/barangay)
  const [addrIdRaw] = await knex("address")
    .insert({ province_id: 20, municipality_id: 24, barangay_id: 22 })
    .returning("id")
    .catch(async () => [await knex("address").insert({ province_id: 20, municipality_id: 24, barangay_id: 22 })]);

  const addrId = typeof addrIdRaw === "object" && addrIdRaw?.id ? addrIdRaw.id : addrIdRaw;

  // Business type/category mapping from seeds/04_type_and_categoties.js
  // Accommodation: type_id=1, example category: Hotel (id=1)

  const business = {
    id: uuidv4(),
    business_name: "Isarog View Hotel",
    description: "A cozy hotel with views of Mt. Isarog.",
    min_price: 1500,
    max_price: 4500,
    email: "isarogview@example.com",
    phone_number: "09171231234",
    business_type_id: 1,
    business_category_id: 1, // Hotel
    address_id: addrId,
    address: "Dayangdang, Naga City, Camarines Sur",
    owner_id: owner.id,
    status: "Active",
    business_image: null,
    latitude: "13.6219",
    longitude: "123.1956",
    x_url: null,
    website_url: "https://isarogview.test",
    facebook_url: "https://facebook.com/isarogview",
    instagram_url: null,
    hasBooking: true,
  };

  await knex("business").insert(business);

  // Optional: Create default 7-day closed schedule in business_hours
  const hours = [];
  for (const day of [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]) {
    hours.push({
      business_id: business.id,
      day_of_week: day,
      open_time: null,
      close_time: null,
      is_open: false,
    });
  }
  await knex("business_hours").insert(hours).catch(() => {});
}
