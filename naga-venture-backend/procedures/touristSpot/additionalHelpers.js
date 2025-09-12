// Additional helpers
export async function createTouristSpotAdditionalHelpers(knex) {
  await knex.raw(`
    CREATE PROCEDURE UpdateTouristSpotTimestamp(IN p_id CHAR(36))
    BEGIN
      UPDATE tourist_spots SET updated_at = CURRENT_TIMESTAMP WHERE id = p_id;
      SELECT ROW_COUNT() AS affected_rows;
    END;
  `);
}

export async function dropTouristSpotAdditionalHelpers(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateTouristSpotTimestamp;");
}
