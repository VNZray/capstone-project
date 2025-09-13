async function createRoomProcedures(knex) {
  
  // Get all rooms
  await knex.raw(`
    CREATE PROCEDURE GetAllRooms()
    BEGIN
      SELECT * FROM room;
    END;
  `);

  // Get room by business ID
  await knex.raw(`
    CREATE PROCEDURE GetRoomByBusinessId(IN p_businessId CHAR(36))
    BEGIN
      SELECT * FROM room WHERE business_id = p_businessId;
    END;
  `);

  // Get room by ID
  await knex.raw(`
    CREATE PROCEDURE GetRoomById(IN p_roomId CHAR(36))
    BEGIN
      SELECT * FROM room WHERE id = p_roomId;
    END;
  `);

  // Insert room
  await knex.raw(`
    CREATE PROCEDURE InsertRoom(
      IN p_id CHAR(36),
      IN p_business_id CHAR(36),
      IN p_room_number VARCHAR(20),
      IN p_room_type VARCHAR(20),
      IN p_description TEXT,
      IN p_room_price FLOAT,
      IN p_room_image VARCHAR(255),
      IN p_status ENUM('Available','Occupied','Maintenance','Reserved'),
      IN p_capacity INT,
      IN p_floor INT
    )
    BEGIN
      INSERT INTO room (
        id, business_id, room_number, room_type, description, room_price, room_image, status, capacity, floor
      ) VALUES (
        p_id, p_business_id, p_room_number, p_room_type, p_description, p_room_price, p_room_image, p_status, p_capacity, p_floor
      );
      SELECT * FROM room WHERE id = p_id;
    END;
  `);

  // Update room (all fields optional)
  await knex.raw(`
    CREATE PROCEDURE UpdateRoom(
      IN p_id CHAR(36),
      IN p_business_id CHAR(36),
      IN p_room_number VARCHAR(20),
      IN p_room_type VARCHAR(20),
      IN p_description TEXT,
      IN p_room_price FLOAT,
      IN p_room_image VARCHAR(255),
      IN p_status ENUM('Available','Occupied','Maintenance','Reserved'),
      IN p_capacity INT,
      IN p_floor INT
    )
    BEGIN
      UPDATE room SET
        business_id = IFNULL(p_business_id, business_id),
        room_number = IFNULL(p_room_number, room_number),
        room_type = IFNULL(p_room_type, room_type),
        description = IFNULL(p_description, description),
        room_price = IFNULL(p_room_price, room_price),
        room_image = IFNULL(p_room_image, room_image),
        status = IFNULL(p_status, status),
        capacity = IFNULL(p_capacity, capacity),
        floor = IFNULL(p_floor, floor)
      WHERE id = p_id;
      SELECT * FROM room WHERE id = p_id;
    END;
  `);

  // Delete room
  await knex.raw(`
    CREATE PROCEDURE DeleteRoom(IN p_id CHAR(36))
    BEGIN
      DELETE FROM room WHERE id = p_id;
    END;
  `);
}

async function dropRoomProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllRooms;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetRoomByBusinessId;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetRoomById;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertRoom;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateRoom;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteRoom;");
}
export { createRoomProcedures, dropRoomProcedures };
