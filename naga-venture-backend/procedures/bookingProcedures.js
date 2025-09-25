
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
		CREATE PROCEDURE GetBookingById(IN p_id CHAR(36))
		BEGIN
			SELECT * FROM booking WHERE id = p_id;
		END;
	`);

	// Get bookings by tourist ID
	await knex.raw(`
		CREATE PROCEDURE GetBookingsByTouristId(IN p_tourist_id CHAR(36))
		BEGIN
			SELECT * FROM booking WHERE tourist_id = p_tourist_id;
		END;
	`);

	// Insert booking
	await knex.raw(`
		CREATE PROCEDURE InsertBooking(
			IN p_id CHAR(36),
			IN p_pax INT,
			IN p_num_children INT,
			IN p_num_adults INT,
			IN p_foreign_counts INT,
			IN p_domestic_counts INT,
			IN p_overseas_counts INT,
			IN p_local_counts INT,
			IN p_trip_purpose VARCHAR(30),
			IN p_check_in_date DATE,
			IN p_check_out_date DATE,
			IN p_total_price FLOAT,
			IN p_balance FLOAT,
			IN p_booking_status ENUM('Pending','Booked','Checked-In','Checked-Out','Canceled'),
			IN p_room_id CHAR(36),
			IN p_tourist_id CHAR(36)
		)
		BEGIN
			INSERT INTO booking (
				id, pax, num_children, num_adults, foreign_counts, domestic_counts, overseas_counts, local_counts,
				trip_purpose, check_in_date, check_out_date, total_price, balance, booking_status, room_id, tourist_id
			) VALUES (
				p_id, p_pax, p_num_children, p_num_adults, p_foreign_counts, p_domestic_counts, p_overseas_counts, p_local_counts,
				p_trip_purpose, p_check_in_date, p_check_out_date, p_total_price, p_balance, p_booking_status, p_room_id, p_tourist_id
			);
			SELECT * FROM booking WHERE id = p_id;
		END;
	`);

	// Update booking (all fields optional except id)
	await knex.raw(`
		CREATE PROCEDURE UpdateBooking(
			IN p_id CHAR(36),
			IN p_pax INT,
			IN p_num_children INT,
			IN p_num_adults INT,
			IN p_foreign_counts INT,
			IN p_domestic_counts INT,
			IN p_overseas_counts INT,
			IN p_local_counts INT,
			IN p_trip_purpose VARCHAR(30),
			IN p_check_in_date DATE,
			IN p_check_out_date DATE,
			IN p_total_price FLOAT,
			IN p_balance FLOAT,
			IN p_booking_status ENUM('Pending','Booked','Checked-In','Checked-Out','Canceled'),
			IN p_room_id CHAR(36),
			IN p_tourist_id CHAR(36)
		)
		BEGIN
			UPDATE booking
			SET
				pax = IFNULL(p_pax, pax),
				num_children = IFNULL(p_num_children, num_children),
				num_adults = IFNULL(p_num_adults, num_adults),
				foreign_counts = IFNULL(p_foreign_counts, foreign_counts),
				domestic_counts = IFNULL(p_domestic_counts, domestic_counts),
				overseas_counts = IFNULL(p_overseas_counts, overseas_counts),
				local_counts = IFNULL(p_local_counts, local_counts),
				trip_purpose = IFNULL(p_trip_purpose, trip_purpose),
				check_in_date = IFNULL(p_check_in_date, check_in_date),
				check_out_date = IFNULL(p_check_out_date, check_out_date),
				total_price = IFNULL(p_total_price, total_price),
				balance = IFNULL(p_balance, balance),
				booking_status = IFNULL(p_booking_status, booking_status),
				room_id = IFNULL(p_room_id, room_id),
				tourist_id = IFNULL(p_tourist_id, tourist_id)
			WHERE id = p_id;
			SELECT * FROM booking WHERE id = p_id;
		END;
	`);

	// Delete booking
	await knex.raw(`
		CREATE PROCEDURE DeleteBooking(IN p_id CHAR(36))
		BEGIN
			DELETE FROM booking WHERE id = p_id;
		END;
	`);
}

async function dropProcedures(knex) {
	await knex.raw('DROP PROCEDURE IF EXISTS GetAllBookings;');
	await knex.raw('DROP PROCEDURE IF EXISTS GetBookingById;');
	await knex.raw('DROP PROCEDURE IF EXISTS GetBookingsByTouristId;');
	await knex.raw('DROP PROCEDURE IF EXISTS InsertBooking;');
	await knex.raw('DROP PROCEDURE IF EXISTS UpdateBooking;');
	await knex.raw('DROP PROCEDURE IF EXISTS DeleteBooking;');
}

export { createProcedures, dropProcedures };
