'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Sample Bookings Seeder
 *
 * Creates tourist users and sample booking data for accommodations.
 * Generates realistic past and future bookings with varied tourist demographics.
 */

// Helper: Random PH mobile number
const randomPhone = () => {
  const prefixes = ['0917', '0918', '0919', '0920', '0921', '0922', '0923', '0924', '0925', '0926', '0927', '0928', '0929'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return prefix + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
};

// Helper: Create time at specific hours
const setHours = (hours, minutes = 0) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

// Random data pools
const firstNames = [
  'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Sofia', 'Miguel', 'Carmen', 'Luis', 'Isabel',
  'Carlos', 'Elena', 'Antonio', 'Rosa', 'Manuel', 'Lucia', 'Francisco', 'Teresa', 'Jorge', 'Pilar',
  'John', 'Emily', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'Robert', 'Sophia',
  'Chen', 'Yuki', 'Raj', 'Priya', 'Ahmed', 'Fatima', 'Mohammed', 'Aisha', 'Wei', 'Min'
];

const lastNames = [
  'Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Rivera', 'Flores', 'Ramos',
  'Gonzalez', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Perez', 'Sanchez', 'Ramirez', 'Diaz', 'Morales',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wang', 'Li', 'Zhang'
];

const nationalities = [
  'Filipino', 'Filipino', 'Filipino', 'Filipino', 'Filipino',
  'American', 'British', 'Australian', 'Canadian', 'Chinese',
  'Japanese', 'Korean', 'Indian', 'Malaysian', 'Singaporean'
];

const genders = ['Male', 'Female'];
const ethnicities = ['Bicolano', 'Non-Bicolano', 'Foreigner'];
const origins = ['Domestic', 'Local', 'Overseas'];

// Helper: Generate random birthdate and age
const getRandomBirthdate = (minAge = 18, maxAge = 60) => {
  const today = new Date();
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = today.getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1;
  const birthdate = new Date(birthYear, birthMonth, birthDay);
  return {
    birthdate: birthdate.toISOString().split('T')[0],
    age
  };
};

// Random selectors
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper: Get random past date (within last 6 months)
const getRandomPastDate = (monthsAgo) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(Math.floor(Math.random() * 28) + 1);
  return date.toISOString().split('T')[0];
};

// Helper: Get random future date
const getRandomFutureDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead + Math.floor(Math.random() * 30));
  return date.toISOString().split('T')[0];
};

// Helper: Get tourist counts (random distribution)
const getRandomTouristCounts = () => {
  const total = Math.floor(Math.random() * 6) + 1;
  const distributions = [
    { local: total, domestic: 0, foreign: 0, overseas: 0 },
    { local: 0, domestic: total, foreign: 0, overseas: 0 },
    { local: Math.floor(total * 0.5), domestic: Math.floor(total * 0.3), foreign: Math.floor(total * 0.2), overseas: 0 },
    { local: Math.floor(total * 0.4), domestic: Math.floor(total * 0.2), foreign: Math.floor(total * 0.2), overseas: Math.floor(total * 0.2) },
  ];
  return distributions[Math.floor(Math.random() * distributions.length)];
};

module.exports = {
  async up(queryInterface) {
    // Check if bookings already exist
    const [existingBookings] = await queryInterface.sequelize.query(
      "SELECT id FROM booking LIMIT 1"
    );

    if (existingBookings.length > 0) {
      console.log('[Seed] Sample bookings already exist, skipping');
      return;
    }

    // Get existing accommodation businesses
    const [businesses] = await queryInterface.sequelize.query(
      "SELECT id, business_name FROM business WHERE hasBooking = true"
    );

    if (businesses.length === 0) {
      console.log('[Seed] No accommodation businesses found, skipping booking seeds');
      return;
    }

    // Get all rooms
    const [allRooms] = await queryInterface.sequelize.query(
      "SELECT id, business_id, room_price FROM room"
    );

    if (allRooms.length === 0) {
      console.log('[Seed] No rooms found, skipping booking seeds');
      return;
    }

    // Create tourist users (50 tourists)
    const touristCount = 50;
    const users = [];
    const touristData = [];

    for (let i = 1; i <= touristCount; i++) {
      const userId = uuidv4();
      const birthInfo = getRandomBirthdate(18, 60);
      const nationality = randomFrom(nationalities);

      // Determine ethnicity based on nationality
      let ethnicity;
      if (nationality === 'Filipino') {
        ethnicity = Math.random() > 0.5 ? 'Bicolano' : 'Non-Bicolano';
      } else {
        ethnicity = 'Foreigner';
      }

      // Determine origin based on nationality
      let origin;
      if (nationality === 'Filipino') {
        origin = Math.random() > 0.5 ? 'Local' : 'Domestic';
      } else {
        origin = 'Overseas';
      }

      users.push({
        id: userId,
        email: `tourist${i}@cityventure.test`,
        phone_number: randomPhone(),
        password: await bcrypt.hash('Tourist123!', 10),
        is_verified: true,
        is_active: true,
        user_role_id: 9, // Tourist role
        barangay_id: Math.floor(Math.random() * 5) + 1
      });

      touristData.push({
        id: uuidv4(),
        first_name: randomFrom(firstNames),
        middle_name: Math.random() > 0.5 ? randomFrom(firstNames) : null,
        last_name: randomFrom(lastNames),
        age: birthInfo.age,
        birthdate: birthInfo.birthdate,
        gender: randomFrom(genders),
        ethnicity,
        nationality,
        origin,
        user_id: userId
      });
    }

    // Insert users
    await queryInterface.bulkInsert('user', users);
    console.log(`[Seed] Inserted ${users.length} tourist users`);

    // Insert tourists
    await queryInterface.bulkInsert('tourist', touristData);
    console.log(`[Seed] Inserted ${touristData.length} tourist profiles`);

    // Generate bookings
    const bookings = [];
    const pastStatuses = ['Reserved', 'Checked-In', 'Checked-Out', 'Canceled'];
    const futureStatuses = ['Pending', 'Reserved'];

    for (const business of businesses) {
      const businessRooms = allRooms.filter(r => r.business_id === business.id);
      if (businessRooms.length === 0) continue;

      // Create 20-30 bookings per business
      const bookingCount = Math.floor(Math.random() * 11) + 20;
      const pastBookingsCount = Math.floor(bookingCount * 0.6);
      const futureBookingsCount = bookingCount - pastBookingsCount;

      // Past bookings
      for (let i = 0; i < pastBookingsCount; i++) {
        const room = randomFrom(businessRooms);
        const tourist = randomFrom(touristData);
        const monthsAgo = Math.floor(Math.random() * 6);

        const checkInDate = getRandomPastDate(monthsAgo);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 4) + 1);

        const numberOfNights = Math.max(1, Math.floor((checkOutDate - new Date(checkInDate)) / (1000 * 60 * 60 * 24)));
        const totalPrice = room.room_price * numberOfNights;
        const touristCounts = getRandomTouristCounts();
        const pax = touristCounts.local + touristCounts.domestic + touristCounts.foreign + touristCounts.overseas;

        bookings.push({
          id: uuidv4(),
          tourist_id: tourist.id,
          business_id: business.id,
          room_id: room.id,
          booking_type: 'overnight',
          check_in_date: checkInDate,
          check_out_date: checkOutDate.toISOString().split('T')[0],
          check_in_time: setHours(14, 0),
          check_out_time: setHours(12, 0),
          booking_status: randomFrom(pastStatuses),
          total_price: totalPrice,
          pax,
          num_adults: Math.max(1, Math.floor(pax * 0.7)),
          num_children: Math.floor(pax * 0.2),
          num_infants: Math.max(0, pax - Math.floor(pax * 0.9)),
          trip_purpose: 'Leisure',
          local_counts: touristCounts.local,
          domestic_counts: touristCounts.domestic,
          foreign_counts: touristCounts.foreign,
          overseas_counts: touristCounts.overseas,
          balance: 0
        });
      }

      // Future bookings
      for (let i = 0; i < futureBookingsCount; i++) {
        const room = randomFrom(businessRooms);
        const tourist = randomFrom(touristData);
        const daysAhead = Math.floor(Math.random() * 60) + 1;

        const checkInDate = getRandomFutureDate(daysAhead);
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 4) + 1);

        const numberOfNights = Math.max(1, Math.floor((checkOutDate - new Date(checkInDate)) / (1000 * 60 * 60 * 24)));
        const totalPrice = room.room_price * numberOfNights;
        const touristCounts = getRandomTouristCounts();
        const pax = touristCounts.local + touristCounts.domestic + touristCounts.foreign + touristCounts.overseas;

        bookings.push({
          id: uuidv4(),
          tourist_id: tourist.id,
          business_id: business.id,
          room_id: room.id,
          booking_type: 'overnight',
          check_in_date: checkInDate,
          check_out_date: checkOutDate.toISOString().split('T')[0],
          check_in_time: setHours(14, 0),
          check_out_time: setHours(12, 0),
          booking_status: randomFrom(futureStatuses),
          total_price: totalPrice,
          pax,
          num_adults: Math.max(1, Math.floor(pax * 0.7)),
          num_children: Math.floor(pax * 0.2),
          num_infants: Math.max(0, pax - Math.floor(pax * 0.9)),
          trip_purpose: 'Leisure',
          local_counts: touristCounts.local,
          domestic_counts: touristCounts.domestic,
          foreign_counts: touristCounts.foreign,
          overseas_counts: touristCounts.overseas,
          balance: totalPrice * 0.5
        });
      }
    }

    // Insert all bookings
    if (bookings.length > 0) {
      await queryInterface.bulkInsert('booking', bookings);

      const pastBookings = bookings.filter(b => pastStatuses.includes(b.booking_status));
      const futureBookings = bookings.filter(b => futureStatuses.includes(b.booking_status));

      console.log(`[Seed] Inserted ${bookings.length} sample bookings`);
      console.log(`[Seed]   - Past bookings: ${pastBookings.length}`);
      console.log(`[Seed]   - Future bookings: ${futureBookings.length}`);
    }
  },

  async down(queryInterface) {
    // Delete bookings
    await queryInterface.bulkDelete('booking', null, {});

    // Delete tourist users (by email pattern)
    await queryInterface.sequelize.query(
      "DELETE FROM tourist WHERE user_id IN (SELECT id FROM user WHERE email LIKE 'tourist%@cityventure.test')"
    );
    await queryInterface.sequelize.query(
      "DELETE FROM user WHERE email LIKE 'tourist%@cityventure.test'"
    );
  }
};
