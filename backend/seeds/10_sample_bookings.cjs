//10_sample_booking.cjs
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Don't delete existing bookings, just add sample data if none exist
  const existingBookings = await knex("booking").select("id").limit(1);

  if (existingBookings.length > 0) {
    console.log("Sample bookings already exist, skipping...");
    return;
  }

  // Get existing businesses and rooms
  const businesses = await knex("business")
    .where("business_type_id", 1) // Accommodation type
    .select("id", "business_name");

  if (businesses.length === 0) {
    console.log("No accommodation businesses found, skipping booking seeds...");
    return;
  }

  // Get existing tourists
  let tourists = await knex("tourist").select("id", "user_id");

  // If no tourists exist, create sample tourists
  if (tourists.length === 0) {
    console.log("Creating sample tourists...");

    // Create sample users for tourists
    const sampleUsers = [
      {
        id: uuidv4(),
        email: "tourist1@gmail.com",
        phone_number: "+639171234567",
        password: await bcrypt.hash('tourist123', 10),
        is_verified: true,
        is_active: true,
        user_role_id: 9, // Tourist role (corrected from 5)
        barangay_id: 1,
      },
      {
        id: uuidv4(),
        email: "tourist2@gmail.com",
        phone_number: "+639181234567",
        password: await bcrypt.hash('tourist123', 10),
        is_verified: true,
        is_active: true,
        user_role_id: 9,
        barangay_id: 2,
      },
      {
        id: uuidv4(),
        email: "tourist3@gmail.com",
        phone_number: "+639191234567",
        password: await bcrypt.hash('tourist123', 10),
        is_verified: true,
        is_active: true,
        user_role_id: 9,
        barangay_id: 3,
      },
    ];

    await knex("user").insert(sampleUsers);

    const sampleTourists = sampleUsers.map((user) => ({
      id: uuidv4(),
      first_name: `Tourist`,
      middle_name: null,
      last_name: `User`,
      age: 25,
      birthdate: "1999-01-01",
      gender: "Male",
      nationality: "Filipino",
      user_id: user.id,
    }));

    await knex("tourist").insert(sampleTourists);
    tourists = await knex("tourist").select("id", "user_id");
  }

  // Get rooms for each business
  const allRooms = await knex("room").select("id", "business_id", "room_price");

  const bookings = [];
  const currentDate = new Date();

  // Helper function to generate random date within the last 6 months
  const getRandomPastDate = (monthsAgo) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    const variance = Math.random() * 30; // Random day within the month
    date.setDate(Math.floor(variance));
    return date.toISOString().split("T")[0];
  };

  // Helper function to generate random future date
  const getRandomFutureDate = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead + Math.floor(Math.random() * 30));
    return date.toISOString().split("T")[0];
  };

  // Helper function to get tourist counts (random distribution)
  const getRandomTouristCounts = () => {
    const total = Math.floor(Math.random() * 8) + 1; // 1-8 tourists per booking
    const distributions = [
      { local: total, domestic: 0, foreign: 0, overseas: 0 }, // All local
      { local: 0, domestic: total, foreign: 0, overseas: 0 }, // All domestic
      { local: 0, domestic: 0, foreign: total, overseas: 0 }, // All foreign
      { local: 0, domestic: 0, foreign: 0, overseas: total }, // All overseas
      {
        // Mixed
        local: Math.floor(total * 0.5),
        domestic: Math.floor(total * 0.3),
        foreign: Math.floor(total * 0.2),
        overseas: 0,
      },
      {
        // Mixed
        local: Math.floor(total * 0.4),
        domestic: Math.floor(total * 0.2),
        foreign: Math.floor(total * 0.2),
        overseas: Math.floor(total * 0.2),
      },
    ];
    return distributions[Math.floor(Math.random() * distributions.length)];
  };

  // Create sample bookings for each business
  for (const business of businesses) {
    const businessRooms = allRooms.filter(
      (room) => room.business_id === business.id
    );

    if (businessRooms.length === 0) continue;

    // Create 50-55 bookings per business: 60% past, 40% future
    const bookingCount = Math.floor(Math.random() * 6) + 50; // 50-55 bookings
    const pastBookingsCount = Math.floor(bookingCount * 0.6); // 60% past bookings
    const futureBookingsCount = bookingCount - pastBookingsCount; // 40% future bookings

    // Create past bookings
    for (let i = 0; i < pastBookingsCount; i++) {
      const room = businessRooms[Math.floor(Math.random() * businessRooms.length)];
      const tourist = tourists[Math.floor(Math.random() * tourists.length)];
      const monthsAgo = Math.floor(Math.random() * 6); // Last 6 months
      const checkInDate = getRandomPastDate(monthsAgo);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 4) + 1); // 1-4 nights

      const numberOfNights = Math.floor(
        (checkOutDate - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = room.room_price * numberOfNights;

      const touristCounts = getRandomTouristCounts();

      const statuses = ["Reserved", "Checked-In", "Checked-Out", "Canceled"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Calculate pax (total tourists)
      const pax = touristCounts.local + touristCounts.domestic + touristCounts.foreign + touristCounts.overseas;
      const numAdults = Math.floor(pax * 0.7);
      const numChildren = Math.floor(pax * 0.2);
      const numInfants = pax - numAdults - numChildren;

      bookings.push({
        id: uuidv4(),
        tourist_id: tourist.id,
        business_id: business.id,
        room_id: room.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate.toISOString().split("T")[0],
        booking_status: status,
        total_price: totalPrice,
        pax: pax,
        num_adults: numAdults,
        num_children: numChildren,
        num_infants: numInfants,
        trip_purpose: "Leisure",
        local_counts: touristCounts.local,
        domestic_counts: touristCounts.domestic,
        foreign_counts: touristCounts.foreign,
        overseas_counts: touristCounts.overseas,
        balance: 0,
        created_at: knex.fn.now(),
      });
    }

    // Create future bookings
    for (let i = 0; i < futureBookingsCount; i++) {
      const room = businessRooms[Math.floor(Math.random() * businessRooms.length)];
      const tourist = tourists[Math.floor(Math.random() * tourists.length)];
      const daysAhead = Math.floor(Math.random() * 60) + 1; // 1-90 days ahead
      const checkInDate = getRandomFutureDate(daysAhead);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 4) + 1); // 1-4 nights

      const numberOfNights = Math.floor(
        (checkOutDate - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
      );
      const totalPrice = room.room_price * numberOfNights;

      const touristCounts = getRandomTouristCounts();

      // Future bookings are mostly Pending or Reserved
      const futureStatuses = ["Pending", "Pending", "Reserved", "Reserved", "Reserved"];
      const status = futureStatuses[Math.floor(Math.random() * futureStatuses.length)];

      // Calculate pax (total tourists)
      const pax = touristCounts.local + touristCounts.domestic + touristCounts.foreign + touristCounts.overseas;
      const numAdults = Math.floor(pax * 0.7);
      const numChildren = Math.floor(pax * 0.2);
      const numInfants = pax - numAdults - numChildren;

      bookings.push({
        id: uuidv4(),
        tourist_id: tourist.id,
        business_id: business.id,
        room_id: room.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate.toISOString().split("T")[0],
        booking_status: status,
        total_price: totalPrice,
        pax: pax,
        num_adults: numAdults,
        num_children: numChildren,
        num_infants: numInfants,
        trip_purpose: "Leisure",
        local_counts: touristCounts.local,
        domestic_counts: touristCounts.domestic,
        foreign_counts: touristCounts.foreign,
        overseas_counts: touristCounts.overseas,
        balance: totalPrice * 0.5, // 50% balance remaining for future bookings
        created_at: knex.fn.now(),
      });
    }
  }

  // Insert all bookings
  if (bookings.length > 0) {
    await knex("booking").insert(bookings);
    
    // Separate past and future bookings for statistics
    const now = new Date();
    const pastBookings = bookings.filter(b => new Date(b.check_in_date) < now);
    const futureBookings = bookings.filter(b => new Date(b.check_in_date) >= now);
    
    console.log(`✅ Successfully created ${bookings.length} sample bookings with tourist data`);
    console.log(`   - Past bookings: ${pastBookings.length}`);
    console.log(`   - Future bookings: ${futureBookings.length}`);
    
    // Summary statistics
    const totalLocal = bookings.reduce((sum, b) => sum + b.local_counts, 0);
    const totalDomestic = bookings.reduce((sum, b) => sum + b.domestic_counts, 0);
    const totalForeign = bookings.reduce((sum, b) => sum + b.foreign_counts, 0);
    const totalOverseas = bookings.reduce((sum, b) => sum + b.overseas_counts, 0);
    
    console.log(`📊 Tourist Distribution:`);
    console.log(`   - Local: ${totalLocal}`);
    console.log(`   - Domestic: ${totalDomestic}`);
    console.log(`   - Foreign: ${totalForeign}`);
    console.log(`   - Overseas: ${totalOverseas}`);
    console.log(`   - Total: ${totalLocal + totalDomestic + totalForeign + totalOverseas}`);
  }
};
