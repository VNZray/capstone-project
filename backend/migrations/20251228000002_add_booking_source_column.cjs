/**
 * Migration: Add booking_source column to booking table
 *
 * This column tracks whether a booking was made online or as a walk-in
 * at the accommodation's front desk.
 */
exports.up = async function (knex) {
  // Add booking_source column
  await knex.schema.alterTable("booking", function (table) {
    table
      .enum("booking_source", ["online", "walk-in"])
      .notNullable()
      .defaultTo("online")
      .after("booking_status");

    // Add guest_name for walk-in guests who may not have tourist account
    table.string("guest_name", 100).nullable().after("booking_source");
    table.string("guest_phone", 20).nullable().after("guest_name");
    table.string("guest_email", 100).nullable().after("guest_phone");
  });

  // Update existing procedures to include new fields
  // First drop the old procedures
  await knex.raw("DROP PROCEDURE IF EXISTS InsertBooking;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateBooking;");

  // Create updated InsertBooking procedure
  await knex.raw(`
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

  // Create updated UpdateBooking procedure
  await knex.raw(`
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
      UPDATE booking
      SET
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

  // Update GetAvailableRoomsByDateRange to also check blocked dates
  await knex.raw("DROP PROCEDURE IF EXISTS GetAvailableRoomsByDateRange;");
  await knex.raw(`
    CREATE PROCEDURE GetAvailableRoomsByDateRange(
      IN p_business_id CHAR(64),
      IN p_start_date DATE,
      IN p_end_date DATE
    )
    BEGIN
      SELECT r.*
      FROM room r
      WHERE r.business_id = p_business_id
      AND r.id NOT IN (
        -- Exclude rooms with overlapping bookings
        SELECT DISTINCT b.room_id
        FROM booking b
        WHERE b.business_id = p_business_id
        AND b.booking_status NOT IN ('Canceled', 'Checked-Out')
        AND (b.check_in_date <= p_end_date AND b.check_out_date >= p_start_date)
      )
      AND r.id NOT IN (
        -- Exclude rooms with blocked dates
        SELECT DISTINCT rbd.room_id
        FROM room_blocked_dates rbd
        WHERE rbd.business_id = p_business_id
        AND (rbd.start_date <= p_end_date AND rbd.end_date >= p_start_date)
      )
      ORDER BY r.room_number;
    END;
  `);

  console.log("Added booking_source column and updated procedures.");
};

exports.down = async function (knex) {
  // Restore original procedures
  await knex.raw("DROP PROCEDURE IF EXISTS InsertBooking;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateBooking;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetAvailableRoomsByDateRange;");

  // Restore original InsertBooking (without new fields)
  await knex.raw(`
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
      IN p_business_id CHAR(64)
    )
    BEGIN
      INSERT INTO booking (
        id, pax, num_children, num_adults, num_infants, foreign_counts, domestic_counts, overseas_counts, local_counts,
        trip_purpose, booking_type, check_in_date, check_out_date, check_in_time, check_out_time, total_price, balance, booking_status, room_id, tourist_id, business_id
      ) VALUES (
        p_id, p_pax, p_num_children, p_num_adults, p_num_infants, p_foreign_counts, p_domestic_counts, p_overseas_counts, p_local_counts,
        p_trip_purpose, p_booking_type, p_check_in_date, p_check_out_date, p_check_in_time, p_check_out_time, p_total_price, p_balance, p_booking_status, p_room_id, p_tourist_id, p_business_id
      );
      SELECT * FROM booking WHERE id = p_id;
    END;
  `);

  // Restore original UpdateBooking
  await knex.raw(`
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
      IN p_business_id CHAR(64)
    )
    BEGIN
      UPDATE booking
      SET
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
        business_id = IFNULL(p_business_id, business_id)
      WHERE id = p_id;
      SELECT * FROM booking WHERE id = p_id;
    END;
  `);

  // Restore original GetAvailableRoomsByDateRange (without blocked dates check)
  await knex.raw(`
    CREATE PROCEDURE GetAvailableRoomsByDateRange(
      IN p_business_id CHAR(64),
      IN p_start_date DATE,
      IN p_end_date DATE
    )
    BEGIN
      SELECT r.*
      FROM room r
      WHERE r.business_id = p_business_id
      AND r.id NOT IN (
        SELECT DISTINCT b.room_id
        FROM booking b
        WHERE b.business_id = p_business_id
        AND b.booking_status NOT IN ('Canceled', 'Checked-Out')
        AND (b.check_in_date <= p_end_date AND b.check_out_date >= p_start_date)
      )
      ORDER BY r.room_number;
    END;
  `);

  // Remove columns
  await knex.schema.alterTable("booking", function (table) {
    table.dropColumn("booking_source");
    table.dropColumn("guest_name");
    table.dropColumn("guest_phone");
    table.dropColumn("guest_email");
  });
};
