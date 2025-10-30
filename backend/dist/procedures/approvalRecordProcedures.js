// Approval record logging procedures
export async function createApprovalRecordProcedures(knex) {
  await knex.raw('DROP PROCEDURE IF EXISTS LogApprovalRecord;');
  await knex.raw(`
    CREATE PROCEDURE LogApprovalRecord(
      IN p_approval_type VARCHAR(16),
      IN p_subject_type VARCHAR(32),
      IN p_subject_id CHAR(36),
      IN p_decision VARCHAR(16),
      IN p_decided_by CHAR(36),
      IN p_remarks TEXT
    )
    BEGIN
      INSERT INTO approval_records (
        id, approval_type, subject_type, subject_id, decision, decided_by, decided_at, remarks
      ) VALUES (
        UUID(), p_approval_type, p_subject_type, p_subject_id, p_decision, p_decided_by, CURRENT_TIMESTAMP, p_remarks
      );
    END;
  `);
}

export async function dropApprovalRecordProcedures(knex) {
  await knex.raw('DROP PROCEDURE IF EXISTS LogApprovalRecord;');
}
