// Migration to add GetApprovalRecords procedure for frontend log display
async function createGetApprovalRecordsProcedure(knex) {
  await knex.raw(`
    CREATE PROCEDURE GetApprovalRecords(
      IN p_entity_type VARCHAR(32),
      IN p_entity_id CHAR(36),
      IN p_decision VARCHAR(16),
      IN p_limit INT
    )
    BEGIN
      DECLARE v_limit INT DEFAULT 100;
      IF p_limit IS NOT NULL THEN
        SET v_limit = p_limit;
      END IF;
      SELECT * FROM approval_records
      WHERE (p_entity_type IS NULL OR entity_type = p_entity_type)
        AND (p_entity_id IS NULL OR entity_id = p_entity_id)
        AND (p_decision IS NULL OR decision = p_decision)
      ORDER BY decided_at DESC
      LIMIT v_limit;
    END;
  `);
}

async function dropGetApprovalRecordsProcedure(knex) {
  await knex.raw('DROP PROCEDURE IF EXISTS GetApprovalRecords;');
}

module.exports.up = async function(knex) {
  await createGetApprovalRecordsProcedure(knex);
};

module.exports.down = async function(knex) {
  await dropGetApprovalRecordsProcedure(knex);
};
