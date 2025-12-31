/**
 * Room Photos Stored Procedures
 * Handles room photos entity operations
 */

/**
 * Create room photos-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createRoomPhotosProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertRoomPhoto(
      IN p_id CHAR(64),
      IN p_room_id CHAR(64),
      IN p_file_url TEXT,
      IN p_file_format VARCHAR(10),
      IN p_file_size BIGINT
    )
    BEGIN
      INSERT INTO room_photos (id, room_id, file_url, file_format, file_size)
      VALUES (p_id, p_room_id, p_file_url, p_file_format, p_file_size);
      SELECT * FROM room_photos WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRoomPhotoById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM room_photos WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRoomPhotosByRoomId(IN p_room_id CHAR(64))
    BEGIN
      SELECT * FROM room_photos WHERE room_id = p_room_id ORDER BY uploaded_at;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteRoomPhoto(IN p_id CHAR(64))
    BEGIN
      DELETE FROM room_photos WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteRoomPhotosByRoomId(IN p_room_id CHAR(64))
    BEGIN
      DELETE FROM room_photos WHERE room_id = p_room_id;
    END;
  `);
}

/**
 * Drop room photos-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropRoomPhotosProcedures(sequelize) {
  const procedures = [
    'InsertRoomPhoto',
    'GetRoomPhotoById',
    'GetRoomPhotosByRoomId',
    'DeleteRoomPhoto',
    'DeleteRoomPhotosByRoomId'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
