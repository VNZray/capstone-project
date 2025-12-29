/**
 * Migration: Add per_hour_rate column to room table
 * This enables short-stay (hourly) bookings for rooms
 */

exports.up = async function (knex) {
  // Add per_hour_rate column to room table
  await knex.schema.alterTable("room", (table) => {
    table.float("per_hour_rate").nullable().after("room_price");
  });

  // Drop existing procedures to recreate them with the new field
  await knex.raw("DROP PROCEDURE IF EXISTS InsertRoom;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateRoom;");

  // Recreate InsertRoom with per_hour_rate
  await knex.raw(`
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

  // Recreate UpdateRoom with per_hour_rate
  await knex.raw(`
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

  console.log("Added per_hour_rate column and updated room procedures.");
};

exports.down = async function (knex) {
  // Remove per_hour_rate column
  await knex.schema.alterTable("room", (table) => {
    table.dropColumn("per_hour_rate");
  });

  // Drop updated procedures
  await knex.raw("DROP PROCEDURE IF EXISTS InsertRoom;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateRoom;");

  // Recreate original InsertRoom without per_hour_rate
  await knex.raw(`
    CREATE PROCEDURE InsertRoom(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_room_number VARCHAR(20),
      IN p_room_type VARCHAR(20),
      IN p_description TEXT,
      IN p_room_price FLOAT,
      IN p_room_image VARCHAR(255),
      IN p_status ENUM('Available','Occupied','Maintenance','Reserved'),
      IN p_capacity INT,
      IN p_floor INT,
      IN p_room_size INT
    )
    BEGIN
      INSERT INTO room (
        id, business_id, room_number, room_type, description, room_price, room_image, status, capacity, floor, room_size
      ) VALUES (
        p_id, p_business_id, p_room_number, p_room_type, p_description, p_room_price, p_room_image, p_status, p_capacity, p_floor, p_room_size
      );
      SELECT * FROM room WHERE id = p_id;
    END;
  `);

  // Recreate original UpdateRoom without per_hour_rate
  await knex.raw(`
    CREATE PROCEDURE UpdateRoom(
      IN p_id CHAR(64),
      IN p_business_id CHAR(64),
      IN p_room_number VARCHAR(20),
      IN p_room_type VARCHAR(20),
      IN p_description TEXT,
      IN p_room_price FLOAT,
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
        room_image = IFNULL(p_room_image, room_image),
        status = IFNULL(p_status, status),
        capacity = IFNULL(p_capacity, capacity),
        floor = IFNULL(p_floor, floor),
        room_size = IFNULL(p_room_size, room_size)
      WHERE id = p_id;
      SELECT * FROM room WHERE id = p_id;
    END;
  `);

  console.log("Removed per_hour_rate column and reverted room procedures.");
};
