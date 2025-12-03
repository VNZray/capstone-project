export async function createProcedures(knex) {

  await knex.raw(`
    CREATE PROCEDURE AddFavorite(
        IN p_id CHAR(36),
        IN p_tourist_id CHAR(36),
        IN p_favorite_type ENUM('accommodation', 'room', 'shop', 'tourist_spot', 'event'),  
        IN p_my_favorite_id CHAR(36)
    )
    BEGIN
      INSERT INTO favorite (id, tourist_id, favorite_type, my_favorite_id)
      VALUES (p_id, p_tourist_id, p_favorite_type, p_my_favorite_id);
    END;
  `);

  // get all favorites procedure
  await knex.raw(`
    CREATE PROCEDURE GetAllFavorites()
    BEGIN
      SELECT * FROM favorite;
    END;
  `);


  // get favorite by id procedure
  await knex.raw(`
    CREATE PROCEDURE GetFavoriteById(IN p_id CHAR(36))
    BEGIN
      SELECT * FROM favorite WHERE id = p_id;
    END;
  `);

  // get favorites by tourist id procedure
    await knex.raw(`
    CREATE PROCEDURE GetFavoritesByTouristId(IN p_tourist_id CHAR(36))
    BEGIN
      SELECT * FROM favorite WHERE tourist_id = p_tourist_id;
    END;
  `);

  // delete favorite by id procedure
  await knex.raw(`
    CREATE PROCEDURE DeleteFavoriteById(IN p_id CHAR(36))
    BEGIN
      DELETE FROM favorite WHERE id = p_id;
    END;
  `);

  // update favorite procedure
    await knex.raw(`
    CREATE PROCEDURE UpdateFavorite(
      IN p_id CHAR(36),
        IN p_favorite_type ENUM('accommodation', 'room', 'shop', 'tourist_spot', 'event'),  
        IN p_my_favorite_id CHAR(36)
    )
    BEGIN
      UPDATE favorite SET
        favorite_type = p_favorite_type,
        my_favorite_id = p_my_favorite_id
      WHERE id = p_id;
    END;
  `);
}

export async function dropProcedures(knex) {
    await knex.raw('DROP PROCEDURE IF EXISTS AddFavorite;');
    await knex.raw('DROP PROCEDURE IF EXISTS GetFavoriteById;');
    await knex.raw('DROP PROCEDURE IF EXISTS GetFavoritesByTouristId;');
    await knex.raw('DROP PROCEDURE IF EXISTS DeleteFavoriteById;');
    await knex.raw('DROP PROCEDURE IF EXISTS UpdateFavorite;');
}