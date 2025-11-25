async function createRoomPhotosProcedures(knex) {
  const procedures = [
    // Insert a new room photo
    `
    CREATE PROCEDURE InsertRoomPhoto(
      IN p_room_id CHAR(36),
      IN p_file_url TEXT,
      IN p_file_format VARCHAR(10),
      IN p_file_size BIGINT
    )
    BEGIN
      INSERT INTO room_photos (id, room_id, file_url, file_format, file_size, uploaded_at)
      VALUES (UUID(), p_room_id, p_file_url, p_file_format, p_file_size, NOW());
    END
    `,

    // Get all room photos
    `
    CREATE PROCEDURE GetAllRoomPhotos()
    BEGIN
      SELECT * FROM room_photos ORDER BY uploaded_at DESC;
    END
    `,

    // Get room photo by ID
    `
    CREATE PROCEDURE GetRoomPhotoById(IN p_id CHAR(36))
    BEGIN
      SELECT * FROM room_photos WHERE id = p_id;
    END
    `,

    // Get all photos for a specific room
    `
    CREATE PROCEDURE GetRoomPhotosByRoomId(IN p_room_id CHAR(36))
    BEGIN
      SELECT * FROM room_photos WHERE room_id = p_room_id ORDER BY uploaded_at DESC;
    END
    `,

    // Update room photo by ID
    `
    CREATE PROCEDURE UpdateRoomPhotoById(
      IN p_id CHAR(36),
      IN p_file_url TEXT,
      IN p_file_format VARCHAR(10),
      IN p_file_size BIGINT
    )
    BEGIN
      UPDATE room_photos
      SET 
        file_url = p_file_url,
        file_format = p_file_format,
        file_size = p_file_size
      WHERE id = p_id;
    END
    `,

    // Delete room photo by ID
    `
    CREATE PROCEDURE DeleteRoomPhotoById(IN p_id CHAR(36))
    BEGIN
      DELETE FROM room_photos WHERE id = p_id;
    END
    `,

    // Delete all photos for a specific room
    `
    CREATE PROCEDURE DeleteRoomPhotosByRoomId(IN p_room_id CHAR(36))
    BEGIN
      DELETE FROM room_photos WHERE room_id = p_room_id;
    END
    `,
  ];

  for (const procedure of procedures) {
    await knex.raw(procedure);
  }
}

async function dropRoomPhotosProcedures(knex) {
  const procedureNames = [
    'InsertRoomPhoto',
    'GetAllRoomPhotos',
    'GetRoomPhotoById',
    'GetRoomPhotosByRoomId',
    'UpdateRoomPhotoById',
    'DeleteRoomPhotoById',
    'DeleteRoomPhotosByRoomId',
  ];

  for (const name of procedureNames) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${name}`);
  }
}

export default {
  createRoomPhotosProcedures,
  dropRoomPhotosProcedures,
};
