async function createTourismCompositeProcedures(knex) {
  // Ensure idempotency
  await knex.raw("DROP PROCEDURE IF EXISTS GetTourismListWithUserRole;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetTourismWithUserRoleById;");

  await knex.raw(`
    CREATE PROCEDURE GetTourismListWithUserRole()
    BEGIN
      SELECT
        t.id AS tourism_id,
        t.first_name,
        t.middle_name,
        t.last_name,
        t.position,
        u.id AS user_id,
        u.email,
        u.phone_number,
        u.is_verified,
        u.is_active,
        u.created_at,
        u.last_login,
        r.id AS role_id,
        r.role_name
      FROM tourism t
      JOIN user u ON u.id = t.user_id
      LEFT JOIN user_role r ON r.id = u.user_role_id
      ORDER BY t.last_name, t.first_name;
    END;
  `);

  await knex.raw(`
    CREATE PROCEDURE GetTourismWithUserRoleById(IN p_id CHAR(64))
    BEGIN
      SELECT
        t.id AS tourism_id,
        t.first_name,
        t.middle_name,
        t.last_name,
        t.position,
        u.id AS user_id,
        u.email,
        u.phone_number,
        u.is_verified,
        u.is_active,
        u.created_at,
        u.last_login,
        r.id AS role_id,
        r.role_name
      FROM tourism t
      JOIN user u ON u.id = t.user_id
      LEFT JOIN user_role r ON r.id = u.user_role_id
      WHERE t.id = p_id
      LIMIT 1;
    END;
  `);

  await knex.raw("DROP PROCEDURE IF EXISTS DeleteTourismStaff;");

  await knex.raw(`
    CREATE PROCEDURE DeleteTourismStaff(IN p_id CHAR(64))
    BEGIN
      DECLARE v_user_id CHAR(64);

      -- Get user_id before deleting tourism record
      SELECT user_id INTO v_user_id FROM tourism WHERE id = p_id;

      -- Delete tourism record
      DELETE FROM tourism WHERE id = p_id;

      -- Delete user record if found
      IF v_user_id IS NOT NULL THEN
        DELETE FROM user WHERE id = v_user_id;
      END IF;
    END;
  `);
}

async function dropTourismCompositeProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetTourismListWithUserRole;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetTourismWithUserRoleById;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteTourismStaff;");
}

module.exports = { createTourismCompositeProcedures, dropTourismCompositeProcedures };
