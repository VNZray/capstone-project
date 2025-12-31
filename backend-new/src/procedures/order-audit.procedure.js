/**
 * Order Audit Stored Procedures
 * Extracted from migration: 20251001000001-order-audit-table.cjs
 *
 * Procedures:
 * - InsertOrderAudit: Insert a new order audit record
 * - GetOrderAuditByOrderId: Get all audit records for an order
 */

/**
 * Create order audit stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createOrderAuditProcedures(sequelize) {
  // InsertOrderAudit - Insert a new order audit record
  await sequelize.query(`
    CREATE PROCEDURE InsertOrderAudit(
      IN p_order_id CHAR(64),
      IN p_action ENUM('created', 'status_changed', 'payment_updated', 'item_added', 'item_removed', 'cancelled', 'refunded'),
      IN p_previous_value JSON,
      IN p_new_value JSON,
      IN p_performed_by CHAR(64),
      IN p_notes TEXT
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO order_audit (id, order_id, action, previous_value, new_value, performed_by, notes)
      VALUES (new_id, p_order_id, p_action, p_previous_value, p_new_value, p_performed_by, p_notes);
      SELECT * FROM order_audit WHERE id = new_id;
    END;
  `);

  // GetOrderAuditByOrderId - Get all audit records for an order with performer info
  await sequelize.query(`
    CREATE PROCEDURE GetOrderAuditByOrderId(IN p_order_id CHAR(64))
    BEGIN
      SELECT oa.*, u.email AS performed_by_email
      FROM order_audit oa
      LEFT JOIN user u ON oa.performed_by = u.id
      WHERE oa.order_id = p_order_id
      ORDER BY oa.created_at DESC;
    END;
  `);
}

/**
 * Drop order audit stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropOrderAuditProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertOrderAudit;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetOrderAuditByOrderId;');
}
