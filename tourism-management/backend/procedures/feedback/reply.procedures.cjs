async function createReplyProcedures(knex) {
  // Get all replies
  await knex.raw(`
    CREATE PROCEDURE GetAllReplies()
    BEGIN
      SELECT * FROM reply ORDER BY created_at DESC;
    END;
  `);

  // Get single reply by ID
  await knex.raw(`
    CREATE PROCEDURE GetReplyById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM reply WHERE id = p_id;
    END;
  `);

  // Get replies by review id (foreign key)
  await knex.raw(`
    CREATE PROCEDURE GetRepliesByReviewId(IN p_review_and_rating_id CHAR(64))
    BEGIN
      SELECT *
      FROM reply
      WHERE review_and_rating_id = p_review_and_rating_id
      ORDER BY created_at ASC;
    END;
  `);

  // Insert reply
  await knex.raw(`
    CREATE PROCEDURE InsertReply(
      IN p_id CHAR(64),
      IN p_review_and_rating_id CHAR(64),
      IN p_message TEXT,
      IN p_responder_id CHAR(64)
    )
    BEGIN
      INSERT INTO reply(
        id, review_and_rating_id, message, responder_id
      ) VALUES (
        p_id, p_review_and_rating_id, p_message, p_responder_id
      );
      SELECT * FROM reply WHERE id = p_id;
    END;
  `);

  // Update reply (message only)
  await knex.raw(`
    CREATE PROCEDURE UpdateReply(
      IN p_id CHAR(64),
      IN p_message TEXT
    )
    BEGIN
      UPDATE reply
      SET message = IFNULL(p_message, message)
      WHERE id = p_id;
      SELECT * FROM reply WHERE id = p_id;
    END;
  `);

  // Delete reply
  await knex.raw(`
    CREATE PROCEDURE DeleteReply(IN p_id CHAR(64))
    BEGIN
      DELETE FROM reply WHERE id = p_id;
    END;
  `);
}

async function dropReplyProcedures(knex) {
  await knex.raw("DROP PROCEDURE IF EXISTS GetAllReplies;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetReplyById;");
  await knex.raw("DROP PROCEDURE IF EXISTS GetRepliesByReviewId;");
  await knex.raw("DROP PROCEDURE IF EXISTS InsertReply;");
  await knex.raw("DROP PROCEDURE IF EXISTS UpdateReply;");
  await knex.raw("DROP PROCEDURE IF EXISTS DeleteReply;");
}

module.exports = { createReplyProcedures, dropReplyProcedures };
