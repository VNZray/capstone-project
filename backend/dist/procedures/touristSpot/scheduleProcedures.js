// Schedule-related procedures
export async function createScheduleProcedures(knex) {
  await knex.raw(`
    CREATE PROCEDURE GetTouristSpotSchedules(IN p_id CHAR(36))
    BEGIN
      SELECT * FROM tourist_spot_schedules WHERE tourist_spot_id = p_id ORDER BY day_of_week ASC;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE DeleteSchedulesByTouristSpot(IN p_id CHAR(36))
    BEGIN
      DELETE FROM tourist_spot_schedules WHERE tourist_spot_id = p_id;
    END;
  `);
  await knex.raw(`
    CREATE PROCEDURE InsertTouristSpotSchedule(
      IN p_tourist_spot_id CHAR(36),
      IN p_day_of_week TINYINT,
      IN p_open_time TIME,
      IN p_close_time TIME,
      IN p_is_closed BOOLEAN
    )
    BEGIN
      INSERT INTO tourist_spot_schedules (id, tourist_spot_id, day_of_week, open_time, close_time, is_closed)
      VALUES (UUID(), p_tourist_spot_id, p_day_of_week, p_open_time, p_close_time, p_is_closed);
    END;
  `);
}

export async function dropScheduleProcedures(knex) {
  const names = [
    'GetTouristSpotSchedules', 'DeleteSchedulesByTouristSpot', 'InsertTouristSpotSchedule'
  ];
  for (const n of names) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${n};`);
  }
}
