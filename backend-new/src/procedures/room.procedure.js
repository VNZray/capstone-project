/**
 * Room Stored Procedures
 * Handles room entity operations
 */

/**
 * Create room-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createRoomProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE InsertRoom(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_room_number VARCHAR(20),
      IN p_room_type VARCHAR(20),
      IN p_description TEXT,
      IN p_room_price FLOAT,
      IN p_per_hour_rate FLOAT,
      IN p_room_image VARCHAR(255),
      IN p_status ENUM('Available','Occupied','Maintenance','Reserved'),
      IN p_capacity INT,
      IN p_floor INT,
      IN p_room_size INT
    )
    BEGIN
      INSERT INTO room (
        id, business_id, room_number, room_type, description, room_price, per_hour_rate, room_image, status, capacity, floor, room_size
      ) VALUES (
        p_id, p_business_id, p_room_number, p_room_type, p_description, p_room_price, p_per_hour_rate, p_room_image, p_status, p_capacity, p_floor, p_room_size
      );
      SELECT * FROM room WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRoomById(IN p_id CHAR(64))
    BEGIN
      SELECT r.*, b.business_name
      FROM room r
      LEFT JOIN business b ON r.business_id = b.id
      WHERE r.id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetRoomsByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT r.*, b.business_name
      FROM room r
      LEFT JOIN business b ON r.business_id = b.id
      WHERE r.business_id = p_business_id
      ORDER BY r.room_number;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateRoom(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_room_number VARCHAR(20),
      IN p_room_type VARCHAR(20),
      IN p_description TEXT,
      IN p_room_price FLOAT,
      IN p_per_hour_rate FLOAT,
      IN p_room_image VARCHAR(255),
      IN p_status ENUM('Available','Occupied','Maintenance','Reserved'),
      IN p_capacity INT,
      IN p_floor INT,
      IN p_room_size INT
    )
    BEGIN
      UPDATE room SET
        business_id = IFNULL(p_business_id, business_id),
        room_number = IFNULL(p_room_number, room_number),
        room_type = IFNULL(p_room_type, room_type),
        description = IFNULL(p_description, description),
        room_price = IFNULL(p_room_price, room_price),
        per_hour_rate = p_per_hour_rate,
        room_image = IFNULL(p_room_image, room_image),
        status = IFNULL(p_status, status),
        capacity = IFNULL(p_capacity, capacity),
        floor = IFNULL(p_floor, floor),
        room_size = IFNULL(p_room_size, room_size)
      WHERE id = p_id;
      SELECT * FROM room WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteRoom(IN p_id CHAR(64))
    BEGIN
      DELETE FROM room WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllRooms()
    BEGIN
      SELECT r.*, b.business_name
      FROM room r
      LEFT JOIN business b ON r.business_id = b.id
      ORDER BY b.business_name, r.room_number;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateRoomStatus(IN p_id CHAR(64), IN p_status ENUM('Available','Occupied','Maintenance','Reserved'))
    BEGIN
      UPDATE room SET status = p_status WHERE id = p_id;
      SELECT * FROM room WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAvailableRoomsByBusinessId(IN p_business_id CHAR(64))
    BEGIN
      SELECT r.*, b.business_name
      FROM room r
      LEFT JOIN business b ON r.business_id = b.id
      WHERE r.business_id = p_business_id AND r.status = 'Available'
      ORDER BY r.room_number;
    END;
  `);
}

/**
 * Drop room-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropRoomProcedures(sequelize) {
  const procedures = [
    'InsertRoom',
    'GetRoomById',
    'GetRoomsByBusinessId',
    'UpdateRoom',
    'DeleteRoom',
    'GetAllRooms',
    'UpdateRoomStatus',
    'GetAvailableRoomsByBusinessId'
  ];

  for (const proc of procedures) {
    await sequelize.query(`DROP PROCEDURE IF EXISTS ${proc};`);
  }
}
