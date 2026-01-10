async function createProcedures(knex) {
  // Get all bookings
  await knex.raw(`
        CREATE PROCEDURE GetAllBookings()
        BEGIN
            SELECT * FROM booking;
        END;
    `);

  // Get booking by ID
  await knex.raw(`
        CREATE PROCEDURE GetBookingById(IN p_id CHAR(64))
        BEGIN
            SELECT * FROM booking WHERE id = p_id;
        END;
    `);

  // Get bookings by tourist ID
  await knex.raw(`
        CREATE PROCEDURE GetBookingsByTouristId(IN p_tourist_id CHAR(64))
        BEGIN
            SELECT * FROM booking WHERE tourist_id = p_tourist_id;
        END;
    `);

  // Get bookings by room ID
  await knex.raw(`
        CREATE PROCEDURE GetBookingsByRoomId(IN p_room_id CHAR(64))
        BEGIN
            SELECT * FROM booking WHERE room_id = p_room_id;
        END;
    `);

  // Get bookings by business ID
  await knex.raw(`
        CREATE PROCEDURE getBookingsByBusinessId(IN p_business_id CHAR(64))
        BEGIN
            SELECT * FROM booking WHERE business_id = p_business_id;
        END;
    `);

  // Insert booking
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

  // Update booking
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

  // Delete booking
  await knex.raw(`
        CREATE PROCEDURE DeleteBooking(IN p_id CHAR(64))
        BEGIN
            DELETE FROM booking WHERE id = p_id;
        END;
    `);

  // Get available rooms by business and date range (also checks blocked dates)
  await knex.raw(`
        CREATE PROCEDURE GetAvailableRoomsByDateRange(
            IN p_business_id CHAR(64),
            IN p_start_date DATE,
            IN p_end_date DATE
        )
        BEGIN
            -- Get all rooms for the business
            -- Exclude rooms that have conflicting bookings or blocked dates
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
}

async function dropProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllBookings;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBookingById;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBookingsByTouristId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBookingsByRoomId;"); // Added missing drop for RoomId
  await knex.raw("DROP PROCEDURE IF EXISTS getBookingsByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertBooking;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateBooking;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteBooking;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetAvailableRoomsByDateRange;");
}

module.exports = { createProcedures, dropProcedures };