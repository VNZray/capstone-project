/**
 * Favorite Stored Procedures
 * Extracted from 20251002000001-favorite-table.cjs
 */

/**
 * Create all favorite-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createFavoriteProcedures(sequelize) {
  await sequelize.query(`
    CREATE PROCEDURE AddFavorite(
      IN p_id CHAR(64),
      IN p_tourist_id CHAR(64),
      IN p_favorite_type ENUM('accommodation', 'room', 'shop', 'tourist_spot', 'event'),
      IN p_my_favorite_id CHAR(64)
    )
    BEGIN
      -- Insert with duplicate key handling (composite unique constraint)
      -- If the combination already exists, do nothing
      INSERT INTO favorite (id, tourist_id, favorite_type, my_favorite_id)
      VALUES (p_id, p_tourist_id, p_favorite_type, p_my_favorite_id)
      ON DUPLICATE KEY UPDATE id = id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetAllFavorites()
    BEGIN
      SELECT * FROM favorite;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetFavoriteById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM favorite WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE GetFavoritesByTouristId(IN p_tourist_id CHAR(64))
    BEGIN
      SELECT * FROM favorite WHERE tourist_id = p_tourist_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE CheckFavoriteExists(
      IN p_tourist_id CHAR(64),
      IN p_favorite_type ENUM('accommodation', 'room', 'shop', 'tourist_spot', 'event'),
      IN p_my_favorite_id CHAR(64)
    )
    BEGIN
      SELECT id FROM favorite
      WHERE tourist_id = p_tourist_id
        AND favorite_type = p_favorite_type
        AND my_favorite_id = p_my_favorite_id
      LIMIT 1;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteFavoriteById(IN p_id CHAR(64))
    BEGIN
      DELETE FROM favorite WHERE id = p_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE DeleteFavoriteByItem(
      IN p_tourist_id CHAR(64),
      IN p_favorite_type ENUM('accommodation', 'room', 'shop', 'tourist_spot', 'event'),
      IN p_my_favorite_id CHAR(64)
    )
    BEGIN
      DELETE FROM favorite
      WHERE tourist_id = p_tourist_id
        AND favorite_type = p_favorite_type
        AND my_favorite_id = p_my_favorite_id;
    END;
  `);

  await sequelize.query(`
    CREATE PROCEDURE UpdateFavorite(
      IN p_id CHAR(64),
      IN p_favorite_type ENUM('accommodation', 'room', 'shop', 'tourist_spot', 'event'),
      IN p_my_favorite_id CHAR(64)
    )
    BEGIN
      UPDATE favorite SET
        favorite_type = p_favorite_type,
        my_favorite_id = p_my_favorite_id
      WHERE id = p_id;
    END;
  `);
}

/**
 * Drop all favorite-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropFavoriteProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS AddFavorite;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetAllFavorites;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetFavoriteById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetFavoritesByTouristId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS CheckFavoriteExists;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteFavoriteById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS DeleteFavoriteByItem;');
  await sequelize.query('DROP PROCEDURE IF EXISTS UpdateFavorite;');
}
