/**
 * Room Blocked Dates Stored Procedures
 * Extracted from 20251009000001-room-blocked-dates-table.cjs
 */

/**
 * Create all room blocked dates-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createRoomBlockedDatesProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertRoomBlockedDates(
      IN p_room_id CHAR(64),
      IN p_start_date DATE,
      IN p_end_date DATE,
      IN p_reason VARCHAR(255),
      IN p_blocked_by CHAR(64)
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO room_blocked_dates (id, room_id, start_date, end_date, reason, blocked_by)
      VALUES (new_id, p_room_id, p_start_date, p_end_date, p_reason, p_blocked_by);
      SELECT * FROM room_blocked_dates WHERE id = new_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRoomBlockedDatesById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM room_blocked_dates WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRoomBlockedDatesByRoomId(IN p_room_id CHAR(64))
    BEGIN
      SELECT * FROM room_blocked_dates
      WHERE room_id = p_room_id AND end_date >= CURDATE()
      ORDER BY start_date ASC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRoomBlockedDatesInRange(
      IN p_room_id CHAR(64),
      IN p_start_date DATE,
      IN p_end_date DATE
    )
    BEGIN
      SELECT * FROM room_blocked_dates
      WHERE room_id = p_room_id
      AND NOT (end_date < p_start_date OR start_date > p_end_date)
      ORDER BY start_date ASC;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE CheckRoomAvailability(
      IN p_room_id CHAR(64),
      IN p_start_date DATE,
      IN p_end_date DATE
    )
    BEGIN
      DECLARE blocked_count INT;
      DECLARE booked_count INT;

      SELECT COUNT(*) INTO blocked_count FROM room_blocked_dates
      WHERE room_id = p_room_id
      AND NOT (end_date < p_start_date OR start_date > p_end_date);

      SELECT COUNT(*) INTO booked_count FROM booking
      WHERE room_id = p_room_id
      AND status NOT IN ('cancelled', 'no_show')
      AND NOT (check_out_date <= p_start_date OR check_in_date >= p_end_date);

      SELECT
        CASE WHEN blocked_count = 0 AND booked_count = 0 THEN true ELSE false END AS is_available,
        blocked_count AS blocked_conflicts,
        booked_count AS booking_conflicts;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteRoomBlockedDates(IN p_id CHAR(64))
    BEGIN
      DELETE FROM room_blocked_dates WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteExpiredRoomBlockedDates()
    BEGIN
      DELETE FROM room_blocked_dates WHERE end_date < CURDATE();
    END;
  `);
}

/**
 * Drop all room blocked dates-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropRoomBlockedDatesProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertRoomBlockedDates;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRoomBlockedDatesById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRoomBlockedDatesByRoomId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetRoomBlockedDatesInRange;');
  await sequelize.query('DROP PROCEDURE IF EXISTS CheckRoomAvailability;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteRoomBlockedDates;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteExpiredRoomBlockedDates;');
}
