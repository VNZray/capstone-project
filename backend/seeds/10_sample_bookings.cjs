const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');

// Helper functions
const randomPhone = () => {
  const prefix = ['0917', '0918', '0919', '0920', '0921', '0922', '0923', '0924', '0925', '0926', '0927', '0928', '0929'];
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];
  const randomNum = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return randomPrefix + randomNum;
};

const setHours = (hours, minutes, seconds = 0, ms = 0) => {
  const date = new Date();
  date.setHours(hours, minutes, seconds, ms);
  return date;
};

const firstNames = [
  'Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Sofia', 'Miguel', 'Carmen', 'Luis', 'Isabel',
  'Carlos', 'Elena', 'Antonio', 'Rosa', 'Manuel', 'Lucia', 'Francisco', 'Teresa', 'Jorge', 'Pilar',
  'John', 'Emily', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'Robert', 'Sophia',
  'Chen', 'Yuki', 'Raj', 'Priya', 'Ahmed', 'Fatima', 'Mohammed', 'Aisha', 'Wei', 'Min',
  'Marco', 'Giulia', 'Pierre', 'Marie', 'Hans', 'Anna', 'Ivan', 'Olga', 'Kim', 'Park'
];

const lastNames = [
  'Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Rivera', 'Flores', 'Ramos',
  'Gonzalez', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Perez', 'Sanchez', 'Ramirez', 'Diaz', 'Morales',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao', 'Wu', 'Zhou',
  'Kumar', 'Singh', 'Patel', 'Khan', 'Ali', 'Hassan', 'Ahmed', 'Mohammed', 'Tanaka', 'Sato'
];

const nationalities = [
  'Filipino', 'Filipino', 'Filipino', 'Filipino', 'Filipino', // More Filipinos
  'American', 'American', 'British', 'Australian', 'Canadian',
  'Chinese', 'Japanese', 'Korean', 'Indian', 'Malaysian',
  'Singaporean', 'Thai', 'Vietnamese', 'Indonesian', 'German',
  'French', 'Spanish', 'Italian', 'Dutch', 'Swedish'
];

const genders = ['Male', 'Female', 'Male', 'Female']; // Equal distribution

const getRandomBirthdate = (minAge = 18, maxAge = 70) => {
  const today = new Date();
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = today.getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1; // Keep it simple, max 28 days
  const birthdate = new Date(birthYear, birthMonth, birthDay);
  return {
    birthdate: birthdate.toISOString().split('T')[0],
    age: age
  };
};

const getRandomName = () => {
  return firstNames[Math.floor(Math.random() * firstNames.length)];
};

const getRandomLastName = () => {
  return lastNames[Math.floor(Math.random() * lastNames.length)];
};

const getRandomGender = () => {
  return genders[Math.floor(Math.random() * genders.length)];
};

const getRandomNationality = () => {
  return nationalities[Math.floor(Math.random() * nationalities.length)];
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Don't delete existing bookings, just add sample data if none exist
  const plainUsers = [];
  for (let i = 1; i <= 100; i++) {
    plainUsers.push({
      id: uuidv4(),
      email: `tourist${i}@gmail.com`,
      phone_number: randomPhone(),
      password: '123456',
      user_role_id: 9,
      user_profile: 'https://scontent.fmnl4-2.fna.fbcdn.net/v/t39.30808-6/473029028_1644429586280092_2882954199635006340_n.jpg?_nc_cat=101&cb2=99be929b-a592a72f&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=Q2TPpDmr4wcQ7kNvwGV4r3E&_nc_oc=Adk0MswTIqYMZKQKdEzGNv4AB4-E69_zhVMxhE3VTiB_jCLtvUfZZdUoP2ED2LeSV7cutXcMMznLvOBLIKzTKQji&_nc_zt=23&_nc_ht=scontent.fmnl4-2.fna&_nc_gid=_kqwUvI_2YT_p82R2Ny6Fw&oh=00_AfiT7s4ORT3mR6W16xEpgDNo88lAcHj24E28vh6YWUfNlw&oe=6931C3F6',
      barangay_id: Math.floor(Math.random() * 5) + 1 // Random barangay 1-5
    });
  }
  
  const users = [];
  for (const u of plainUsers) {
    const hashed = await bcrypt.hash(u.password, 10);
    users.push({
      id: u.id,
      email: u.email,
      phone_number: u.phone_number,
      password: hashed,
      is_verified: true,
      is_active: true,
      user_profile: 'https://scontent.fmnl4-2.fna.fbcdn.net/v/t39.30808-6/473029028_1644429586280092_2882954199635006340_n.jpg?_nc_cat=101&cb2=99be929b-a592a72f&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=Q2TPpDmr4wcQ7kNvwGV4r3E&_nc_oc=Adk0MswTIqYMZKQKdEzGNv4AB4-E69_zhVMxhE3VTiB_jCLtvUfZZdUoP2ED2LeSV7cutXcMMznLvOBLIKzTKQji&_nc_zt=23&_nc_ht=scontent.fmnl4-2.fna&_nc_gid=_kqwUvI_2YT_p82R2Ny6Fw&oh=00_AfiT7s4ORT3mR6W16xEpgDNo88lAcHj24E28vh6YWUfNlw&oe=6931C3F6',
      user_role_id: u.user_role_id,
      barangay_id: u.barangay_id
    });
  }
  
  // Note: Ensure your 'user' table constraints allow inserting duplicates if running seed multiple times, 
  // or use .onConflict().ignore() if supported by your DB version.
  // For now, assuming fresh DB or unique emails.
  try {
     await knex('user').insert(users).onConflict('email').ignore();
  } catch (e) {
     // Fallback if onConflict isn't supported or needed
  }
  
  // ---------------------------------------------------------------------------
  // Tourist
  // ---------------------------------------------------------------------------
  const generateTourists = plainUsers.map((user) => {
    const birthInfo = getRandomBirthdate(18, 70);
    const gender = getRandomGender();
    return {
      id: uuidv4(),
      first_name: getRandomName(),
      middle_name: Math.random() > 0.5 ? getRandomName() : null,
      last_name: getRandomLastName(),
      age: birthInfo.age,
      birthdate: birthInfo.birthdate,
      gender: gender,
      nationality: getRandomNationality(),
      user_id: user.id,
    };
  });
  
  // Handle potential duplicates for tourists if re-seeding
  try {
      await knex("tourist").insert(generateTourists).onConflict('user_id').ignore();
  } catch(e) {}


  const existingBookings = await knex("booking").select("id").limit(1);

  if (existingBookings.length > 0) {
    console.log("Sample bookings already exist, skipping...");
    return;
  }

  // Get existing businesses and rooms (accommodations have hasBooking=true)
  const businesses = await knex("business")
    .where("hasBooking", true)
    .select("id", "business_name");

  if (businesses.length === 0) {
    console.log("No accommodation businesses found, skipping booking seeds...");
    return;
  }

  // Get existing tourists
  let tourists = await knex("tourist").select("id", "user_id");

  // Get rooms for each business
  const allRooms = await knex("room").select("id", "business_id", "room_price");

  const bookings = [];
  const currentDate = new Date();

  // UPDATED: Return Date object instead of string
  const getRandomPastDate = (monthsAgo) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    const variance = Math.random() * 30; // Random day within the month
    date.setDate(Math.floor(variance));
    return date; 
  };

  // UPDATED: Return Date object instead of string
  const getRandomFutureDate = (daysAhead) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead + Math.floor(Math.random() * 30));
    return date;
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
      
      // UPDATED: Handle Time
      const checkInDate = getRandomPastDate(monthsAgo);
      const checkInTime = setHours(14, 0, 0, 0); // Check in at 2:00 PM
      
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 4) + 1); // 1-4 nights
      const checkOutTime = setHours(12, 0, 0, 0); // Check out at 12:00 PM

      const numberOfNights = Math.floor(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
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
        booking_type: "overnight",
        check_in_date: checkInDate, // Pass object directly
        check_out_date: checkOutDate, // Pass object directly
        check_in_time: checkInTime, // Pass object directly
        check_out_time: checkOutTime, // Pass object directly
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
      
      // UPDATED: Handle Time
      const checkInDate = getRandomFutureDate(daysAhead);
      const checkInTime = setHours(14, 0, 0, 0); // Check in at 2:00 PM

      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 4) + 1); // 1-4 nights
      const checkOutTime = setHours(12, 0, 0, 0); // Check out at 12:00 PM

      const numberOfNights = Math.floor(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
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
                booking_type: "overnight",

        check_in_date: checkInDate, // Pass object directly
        check_out_date: checkOutDate, // Pass object directly
        check_in_time: checkInTime, // Pass object directly
        check_out_time: checkOutTime, // Pass object directly
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
    const pastBookings = bookings.filter(b => b.check_in_date < now);
    const futureBookings = bookings.filter(b => b.check_in_date >= now);
    
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