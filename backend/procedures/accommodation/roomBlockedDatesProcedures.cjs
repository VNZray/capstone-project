/**
 * Room Blocked Dates Procedures
 *
 * Stored procedures for managing room date blocks (maintenance, unavailability, etc.)
 */

async function createProcedures(knex) {
  // Get all blocked dates
  await knex.raw(`
    CREATE PROCEDURE GetAllRoomBlockedDates()
    BEGIN
      SELECT * FROM room_blocked_dates ORDER BY start_date;
    END;
  `);

  // Get blocked dates by ID
  await knex.raw(`
    CREATE PROCEDURE GetRoomBlockedDateById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM room_blocked_dates WHERE id = p_id;
    END;
  `);

  // Get blocked dates by room ID
  await knex.raw(`
    CREATE PROCEDURE GetBlockedDatesByRoomId(IN p_room_id CHAR(64))
    BEGIN
      SELECT * FROM room_blocked_dates
      WHERE room_id = p_room_id
      ORDER BY start_date;
    END;
  `);

  // Get blocked dates by business ID
  await knex.raw(`
    CREATE PROCEDURE GetBlockedDatesByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT rbd.*, r.room_number
      FROM room_blocked_dates rbd
      JOIN room r ON rbd.room_id = r.id
      WHERE rbd.business_id = p_business_id
      ORDER BY rbd.start_date;
    END;
  `);

  // Get blocked dates for a room within date range
  await knex.raw(`
    CREATE PROCEDURE GetBlockedDatesInRange(
      IN p_room_id CHAR(64),
      IN p_start_date DATE,
      IN p_end_date DATE
    )
    BEGIN
      SELECT * FROM room_blocked_dates
      WHERE room_id = p_room_id
      AND (start_date <= p_end_date AND end_date >= p_start_date)
      ORDER BY start_date;
    END;
  `);

  // Insert blocked date
  await knex.raw(`
    CREATE PROCEDURE InsertRoomBlockedDate(
      IN p_id CHAR(64),
      IN p_room_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_start_date DATE,
      IN p_end_date DATE,
      IN p_block_reason ENUM('Maintenance','Renovation','Private','Seasonal','Other'),
      IN p_notes VARCHAR(500),
      IN p_created_by CHAR(64)
    )
    BEGIN
      INSERT INTO room_blocked_dates (
        id, room_id, business_id, start_date, end_date, block_reason, notes, created_by
      ) VALUES (
        p_id, p_room_id, p_business_id, p_start_date, p_end_date, p_block_reason, p_notes, p_created_by
      );
      SELECT rbd.*, r.room_number
      FROM room_blocked_dates rbd
      JOIN room r ON rbd.room_id = r.id
      WHERE rbd.id = p_id;
    END;
  `);

  // Update blocked date
  await knex.raw(`
    CREATE PROCEDURE UpdateRoomBlockedDate(
      IN p_id CHAR(64),
      IN p_room_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_start_date DATE,
      IN p_end_date DATE,
      IN p_block_reason ENUM('Maintenance','Renovation','Private','Seasonal','Other'),
      IN p_notes VARCHAR(500),
      IN p_created_by CHAR(64)
    )
    BEGIN
      UPDATE room_blocked_dates
      SET
        room_id = IFNULL(p_room_id, room_id),
        business_id = IFNULL(p_business_id, business_id),
        start_date = IFNULL(p_start_date, start_date),
        end_date = IFNULL(p_end_date, end_date),
        block_reason = IFNULL(p_block_reason, block_reason),
        notes = IFNULL(p_notes, notes),
        updated_at = NOW()
      WHERE id = p_id;
      SELECT rbd.*, r.room_number
      FROM room_blocked_dates rbd
      JOIN room r ON rbd.room_id = r.id
      WHERE rbd.id = p_id;
    END;
  `);

  // Delete blocked date
  await knex.raw(`
    CREATE PROCEDURE DeleteRoomBlockedDate(IN p_id CHAR(64))
    BEGIN
      DELETE FROM room_blocked_dates WHERE id = p_id;
    END;
  `);

  // Check if dates are available (no conflicts with bookings or blocks)
  await knex.raw(`
    CREATE PROCEDURE CheckRoomAvailability(
      IN p_room_id CHAR(64),
      IN p_start_date DATE,
      IN p_end_date DATE
    )
    BEGIN
      SELECT
        CASE
          WHEN EXISTS (
            SELECT 1 FROM booking
            WHERE room_id = p_room_id
            AND booking_status NOT IN ('Canceled', 'Checked-Out')
            AND (check_in_date <= p_end_date AND check_out_date >= p_start_date)
          ) THEN 'BOOKING_CONFLICT'
          WHEN EXISTS (
            SELECT 1 FROM room_blocked_dates
            WHERE room_id = p_room_id
            AND (start_date <= p_end_date AND end_date >= p_start_date)
          ) THEN 'BLOCKED'
          ELSE 'AVAILABLE'
        END AS availability_status;
    END;
  `);
}

async function dropProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllRoomBlockedDates;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetRoomBlockedDateById;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBlockedDatesByRoomId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBlockedDatesByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetBlockedDatesInRange;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertRoomBlockedDate;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateRoomBlockedDate;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteRoomBlockedDate;");
  await knex.raw("DROP PROCEDURE IF EXISTS CheckRoomAvailability;");
}

module.exports = { createProcedures, dropProcedures };
