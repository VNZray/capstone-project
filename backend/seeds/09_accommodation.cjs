
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require("uuid");

function randomPhone() {
  // Generates a random PH mobile number: +639XXXXXXXXX
  return '+639' + Math.floor(100000000 + Math.random() * 900000000);
}

/** @param { import('knex').Knex } knex */
module.exports.seed = async function (knex) {
  await knex('business').del();           // References: owner, address, etc.
  await knex('owner').del();              // References: user, address
  await knex('tourism').del();            // References: user
  await knex('tourist').del();            // References: user, address
  await knex('user').del();               // References: user_role

  const plainUsers = [
    { id: uuidv4(), email: 'owner1@gmail.com',   phone_number: randomPhone(), password: 'owner123',   user_role_id: 4, barangay_id: 1 },
    { id: uuidv4(), email: 'owner2@gmail.com',   phone_number: randomPhone(), password: 'owner123',   user_role_id: 4, barangay_id: 2 },
  ];

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
      user_role_id: u.user_role_id,
      barangay_id: u.barangay_id
    });
  }

  await knex('user').insert(users);

// ---------------------------------------------------------------------------
// Owner 1
// ---------------------------------------------------------------------------
  const owner1 = {
    id: uuidv4(),
    first_name: 'Rayven',
    middle_name: null,
    last_name: 'Clores',
    age: 35,
    birthdate: '1990-01-01',
    gender: 'Male',
    user_id: plainUsers[0].id
  };
  await knex('owner').insert(owner1);

  const VillaCaceresHotel = [
    {
      id: uuidv4(),
      business_name: 'Villa Caceres Hotel',
      description: `Discover the incomparable at Villa Caceres Hotel in Naga City, Philippines.

      Luxury meets functionality at our property, known as The Gem of Bicolandia, as we combine Victorian themes and elements with exceptional amenities and services.
      Bask in utmost comfort inside our luxurious rooms and suites, each a space of ease and relaxation with plush beds, air-conditioning, cable TV, and a private bathroom.

      Our facilities, meanwhile, will make every vacation complete with a state-of-the-art gym, swimming pool, and sauna and spa services at our Health Club Resort.

      Wrapping up your ultimate Bicol getaway are the bars, restaurants, and other popular spots in the entertainment strip of Magsaysay Avenue, many of which are near the hotel.

      A 3-star hotel with a 5-star experience — is Villa Caceres Hotel.`,
      min_price: 4000,
      max_price: 4000,
      email: 'villa-caceres@gmail.com',
      phone_number: randomPhone(),
      business_type_id: 1, // Accommodation type id
      business_category_id: 1, // Hotel category
      barangay_id: 1,
      address: 'Abella, Naga City, Camarines Sur',
      owner_id: owner1.id,
      status: 'Active',
      business_image: 'https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/business-profile/business-profile/VillaCaceres_1_2025-11-07T18-14-20-305Z.webp',
      latitude: '13.6218',
      longitude: '123.1948',
      hasBooking: true
    },
  ];

  await knex('business').insert(VillaCaceresHotel);

  const VillaCaceresHotelRooms = [
    {
      id: uuidv4(),
      room_number: '1',
      description: null,
      room_type: 'Standard Single',
      room_price: 4000,
      room_size: 25,
      status: 'Available',
      room_image: 'https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/room-profile/Villa%20Caceres%20Hotel/Standard%20Single_2025-11-07T18-18-09-404Z.jpeg',
      floor: 1,
      capacity: 1,
      business_id: VillaCaceresHotel[0].id,
    },
    {
      id: uuidv4(),
      room_number: '2',
      description: null,
      room_type: 'Standard Single',
      room_price: 4000,
      room_size: 25,
      status: 'Available',
      room_image: 'https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/room-profile/Villa%20Caceres%20Hotel/Standard%20Single_2025-11-07T18-18-09-404Z.jpeg',
      floor: 1,
      capacity: 1,
      business_id: VillaCaceresHotel[0].id,
    },
  ];

  await knex('room').insert(VillaCaceresHotelRooms);

// ---------------------------------------------------------------------------
// Owner 2
// ---------------------------------------------------------------------------
  const owner2 = {
    id: uuidv4(),
    first_name: 'Emmanuel',
    middle_name: null,
    last_name: 'Collao',
    age: 35,
    birthdate: '1990-01-01',
    gender: 'Male',
    user_id: plainUsers[1].id
  };
  await knex('owner').insert(owner2);

  const DiamondResidences = [
    {
      id: uuidv4(),
      business_name: 'Diamond Residences',
      description: `Diamond Residences offers 10 rooms of different sizes (Single, twin bed, double bed, and family rooms, hot & cold showers, Wi-Fi access, cable TV, and air conditioning. It was built in 2017. `,
      min_price: 4000,
      max_price: 4000,
      email: 'diamond-residences@gmail.com',
  phone_number: randomPhone(),
      business_type_id: 1, // Accommodation type id
      business_category_id: 1, // Hotel category
      barangay_id: 2,
      address: 'Abella, Naga City, Camarines Sur',
      owner_id: owner2.id,
      status: 'Active',
      business_image: 'https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/business-profile/business-profile/474197270_1060157775916576_8384920636556659319_n_2025-11-07T18-31-33-943Z.jpg',
      latitude: '13.6218',
      longitude: '123.1948',
      hasBooking: true
    },
  ];

  await knex('business').insert(DiamondResidences);

  const DiamondResidencesRooms = [
    {
      id: uuidv4(),
      room_number: '1',
      description: null,
      room_type: 'Double Bed',
      room_price: 4000,
      room_size: 25,
      status: 'Available',
      room_image: 'https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/room-profile/Diamond%20Residences/1_2025-11-07T18-34-09-688Z.jpg',
      floor: 1,
      capacity: 2,
      business_id: DiamondResidences[0].id,
    },
    {
      id: uuidv4(),
      room_number: '2',
      description: null,
      room_type: 'Family Room',
      room_price: 4000,
      room_size: 25,
      status: 'Available',
      room_image: 'https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/room-profile/Diamond%20Residences/2_2025-11-07T18-34-21-406Z.jpg',
      floor: 1,
      capacity: 5,
      business_id: DiamondResidences[0].id,
    },
        {
      id: uuidv4(),
      room_number: '3',
      description: null,
      room_type: 'Couple Room',
      room_price: 4000,
      room_size: 25,
      status: 'Available',
      room_image: 'https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/room-profile/Diamond%20Residences/3_2025-11-07T18-35-05-375Z.jpg',
      floor: 1,
      capacity: 2,
      business_id: DiamondResidences[0].id,
    },
            {
      id: uuidv4(),
      room_number: '4',
      description: null,
      room_type: 'Family Room',
      room_price: 4000,
      room_size: 25,
      status: 'Available',
      room_image: 'https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/room-profile/Diamond%20Residences/4_2025-11-07T18-35-54-269Z.jpg',
      floor: 1,
      capacity: 3,
      business_id: DiamondResidences[0].id,
    },
            {
      id: uuidv4(),
      room_number: '5',
      description: null,
      room_type: 'Double Bed',
      room_price: 4000,
      room_size: 25,
      status: 'Available',
      room_image: 'https://ieodjlfkxmhbtgppddhw.supabase.co/storage/v1/object/public/room-profile/Diamond%20Residences/5_2025-11-07T18-36-28-221Z.jpg',
      floor: 1,
      capacity: 2,
      business_id: DiamondResidences[0].id,
    },
  ];

  await knex('room').insert(DiamondResidencesRooms);
}