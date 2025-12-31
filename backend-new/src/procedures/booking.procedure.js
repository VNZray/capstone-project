/**
 * Booking Stored Procedures
 * Handles booking entity operations
 */

/**
 * Create booking-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createBookingProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertBooking(
      IN p_id CHAR(64),
      IN p_pax INT,
      IN p_num_children INT,
      IN p_num_adults INT,
      IN p_num_infants INT,
      IN p_foreign_counts INT,
      IN p_domestic_counts INT,
      IN p_overseas_counts INT,
      IN p_local_counts INT,
      IN p_trip_purpose VARCHAR(30),
      IN p_booking_type ENUM('overnight','short-stay'),
      IN p_check_in_date DATE,
      IN p_check_out_date DATE,
      IN p_check_in_time TIME,
      IN p_check_out_time TIME,
      IN p_total_price FLOAT,
      IN p_balance FLOAT,
      IN p_booking_status ENUM('Pending','Reserved','Checked-In','Checked-Out','Canceled'),
      IN p_room_id CHAR(64),
      IN p_tourist_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_booking_source ENUM('online','walk-in'),
      IN p_guest_name VARCHAR(100),
      IN p_guest_phone VARCHAR(20),
      IN p_guest_email VARCHAR(100)
    )
    BEGIN
      INSERT INTO booking (
        id, pax, num_children, num_adults, num_infants, foreign_counts, domestic_counts, overseas_counts, local_counts,
        trip_purpose, booking_type, check_in_date, check_out_date, check_in_time, check_out_time, total_price, balance,
        booking_status, room_id, tourist_id, business_id, booking_source, guest_name, guest_phone, guest_email
      ) VALUES (
        p_id, p_pax, p_num_children, p_num_adults, p_num_infants, p_foreign_counts, p_domestic_counts, p_overseas_counts, p_local_counts,
        p_trip_purpose, p_booking_type, p_check_in_date, p_check_out_date, p_check_in_time, p_check_out_time, p_total_price, p_balance,
        p_booking_status, p_room_id, p_tourist_id, p_business_id,
        IFNULL(p_booking_source, 'online'), p_guest_name, p_guest_phone, p_guest_email
      );
      SELECT * FROM booking WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBookingById(IN p_id CHAR(64))
    BEGIN
      SELECT b.*, r.room_number, r.room_type, r.room_price,
             biz.business_name, t.first_name AS tourist_first_name, t.last_name AS tourist_last_name
      FROM booking b
      LEFT JOIN room r ON b.room_id = r.id
      LEFT JOIN business biz ON b.business_id = biz.id
      LEFT JOIN tourist t ON b.tourist_id = t.id
      WHERE b.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBookingsByTouristId(IN p_tourist_id CHAR(64))
    BEGIN
      SELECT b.*, r.room_number, r.room_type, r.room_price, biz.business_name
      FROM booking b
      LEFT JOIN room r ON b.room_id = r.id
      LEFT JOIN business biz ON b.business_id = biz.id
      WHERE b.tourist_id = p_tourist_id
      ORDER BY b.created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBookingsByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT b.*, r.room_number, r.room_type, r.room_price,
             t.first_name AS tourist_first_name, t.last_name AS tourist_last_name
      FROM booking b
      LEFT JOIN room r ON b.room_id = r.id
      LEFT JOIN tourist t ON b.tourist_id = t.id
      WHERE b.business_id = p_business_id
      ORDER BY b.created_at DESC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetBookingsByRoomId(IN p_room_id CHAR(64))
    BEGIN
      SELECT b.*, t.first_name AS tourist_first_name, t.last_name AS tourist_last_name
      FROM booking b
      LEFT JOIN tourist t ON b.tourist_id = t.id
      WHERE b.room_id = p_room_id
      ORDER BY b.check_in_date;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateBooking(
      IN p_id CHAR(64),
      IN p_pax INT,
      IN p_num_children INT,
      IN p_num_adults INT,
      IN p_num_infants INT,
      IN p_foreign_counts INT,
      IN p_domestic_counts INT,
      IN p_overseas_counts INT,
      IN p_local_counts INT,
      IN p_trip_purpose VARCHAR(30),
      IN p_booking_type ENUM('overnight','short-stay'),
      IN p_check_in_date DATE,
      IN p_check_out_date DATE,
      IN p_check_in_time TIME,
      IN p_check_out_time TIME,
      IN p_total_price FLOAT,
      IN p_balance FLOAT,
      IN p_booking_status ENUM('Pending','Reserved','Checked-In','Checked-Out','Canceled'),
      IN p_room_id CHAR(64),
      IN p_tourist_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_booking_source ENUM('online','walk-in'),
      IN p_guest_name VARCHAR(100),
      IN p_guest_phone VARCHAR(20),
      IN p_guest_email VARCHAR(100)
    )
    BEGIN
      UPDATE booking SET
        pax = IFNULL(p_pax, pax),
        num_children = IFNULL(p_num_children, num_children),
        num_adults = IFNULL(p_num_adults, num_adults),
        num_infants = IFNULL(p_num_infants, num_infants),
        foreign_counts = IFNULL(p_foreign_counts, foreign_counts),
        domestic_counts = IFNULL(p_domestic_counts, domestic_counts),
        overseas_counts = IFNULL(p_overseas_counts, overseas_counts),
        local_counts = IFNULL(p_local_counts, local_counts),
        trip_purpose = IFNULL(p_trip_purpose, trip_purpose),
        booking_type = IFNULL(p_booking_type, booking_type),
        check_in_date = IFNULL(p_check_in_date, check_in_date),
        check_out_date = IFNULL(p_check_out_date, check_out_date),
        check_in_time = IFNULL(p_check_in_time, check_in_time),
        check_out_time = IFNULL(p_check_out_time, check_out_time),
        total_price = IFNULL(p_total_price, total_price),
        balance = IFNULL(p_balance, balance),
        booking_status = IFNULL(p_booking_status, booking_status),
        room_id = IFNULL(p_room_id, room_id),
        tourist_id = IFNULL(p_tourist_id, tourist_id),
        business_id = IFNULL(p_business_id, business_id),
        booking_source = IFNULL(p_booking_source, booking_source),
        guest_name = IFNULL(p_guest_name, guest_name),
        guest_phone = IFNULL(p_guest_phone, guest_phone),
        guest_email = IFNULL(p_guest_email, guest_email)
      WHERE id = p_id;
      SELECT * FROM booking WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateBookingStatus(IN p_id CHAR(64), IN p_status ENUM('Pending','Reserved','Checked-In','Checked-Out','Canceled'))
    BEGIN
      UPDATE booking SET booking_status = p_status WHERE id = p_id;
      SELECT * FROM booking WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteBooking(IN p_id CHAR(64))
    BEGIN
      DELETE FROM booking WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllBookings()
    BEGIN
      SELECT b.*, r.room_number, r.room_type, r.room_price,
             biz.business_name, t.first_name AS tourist_first_name, t.last_name AS tourist_last_name
      FROM booking b
      LEFT JOIN room r ON b.room_id = r.id
      LEFT JOIN business biz ON b.business_id = biz.id
      LEFT JOIN tourist t ON b.tourist_id = t.id
      ORDER BY b.created_at DESC;
    END;
  `);
}

/**
 * Drop booking-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropBookingProcedures(sequelize) {
  const procedures = [
    'InsertBooking',
    'GetBookingById',
    'GetBookingsByTouristId',
    'GetBookingsByBusinessId',
    'GetBookingsByRoomId',
    'UpdateBooking',
    'UpdateBookingStatus',
    'DeleteBooking',
    'GetAllBookings'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
