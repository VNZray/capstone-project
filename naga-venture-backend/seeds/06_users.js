import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

/**
 * Seed sample users: Tourist, Owner, Tourism (Admin)
 * - Inserts base rows into tourism/owner/tourist tables
 * - Inserts corresponding rows into user table with hashed passwords
 *
 * Default credentials:
 *   - Admin (Tourism): admin@cityventure.test / Admin123!
 *   - Owner: owner@cityventure.test / Owner123!
 *   - Tourist: tourist@cityventure.test / Tourist123!
 */
export async function seed(knex) {
  // Wipe existing related data in safe order (user depends on entity tables)
  await knex("user").del();
  await knex("tourism").del();
  await knex("owner").del();
  await knex("tourist").del();

  // Create IDs
  const tourismId = uuidv4();
  const ownerId = uuidv4();
  const touristId = uuidv4();

  // Create a minimal address (all fields nullable in schema)
  const inserted = await knex("address").insert({});
  // For MySQL, insert returns an array with the insertId
  const addressId = Array.isArray(inserted) ? inserted[0] : inserted;

  // Insert base entity rows
  await knex("tourism").insert({
    id: tourismId,
    first_name: "Alice",
    middle_name: null,
    last_name: "Admin",
    position: "Tourism Officer",
    phone_number: "09171234567",
    email: "admin@cityventure.test",
  });

  await knex("owner").insert({
    id: ownerId,
    first_name: "Oliver",
    middle_name: null,
    last_name: "Owner",
    age: null,
    birthday: null,
    gender: null,
    email: "owner@cityventure.test",
    phone_number: "09181234567",
    business_type: "Accommodation",
    address_id: null,
  });

  await knex("tourist").insert({
    id: touristId,
    first_name: "Tina",
    middle_name: null,
    last_name: "Tourist",
    ethnicity: "Bicolano",
    birthday: "2000-01-01",
    age: 25,
    gender: "Prefer not to say",
    nationality: "PH",
    category: "Domestic",
    phone_number: "09191234567",
    email: "tourist@cityventure.test",
    address_id: addressId,
  });

  // Hash passwords
  const adminHash = await bcrypt.hash("Admin123!", 10);
  const ownerHash = await bcrypt.hash("Owner123!", 10);
  const touristHash = await bcrypt.hash("Tourist123!", 10);

  // Insert users linked to entities
  await knex("user").insert([
    {
      id: uuidv4(),
      role: "Tourism",
      email: "admin@cityventure.test",
      phone_number: "09171234567",
      password: adminHash,
      user_profile: null,
      tourist_id: null,
      owner_id: null,
      tourism_id: tourismId,
    },
    {
      id: uuidv4(),
      role: "Owner",
      email: "owner@cityventure.test",
      phone_number: "09181234567",
      password: ownerHash,
      user_profile: null,
      tourist_id: null,
      owner_id: ownerId,
      tourism_id: null,
    },
    {
      id: uuidv4(),
      role: "Tourist",
      email: "tourist@cityventure.test",
      phone_number: "09191234567",
      password: touristHash,
      user_profile: null,
      tourist_id: touristId,
      owner_id: null,
      tourism_id: null,
    },
  ]);
}
