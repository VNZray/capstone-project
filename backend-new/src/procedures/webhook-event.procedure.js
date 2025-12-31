/**
 * Webhook Event Stored Procedures
 * Extracted from 20250929000001-webhook-event-table.cjs migration
 */

/**
 * Create all webhook event-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function createWebhookEventProcedures(sequelize) {
  // InsertWebhookEvent - Create a new webhook event record
  await sequelize.query(`
    CREATE PROCEDURE InsertWebhookEvent(
      IN p_event_id VARCHAR(255),
      IN p_event_type VARCHAR(100),
      IN p_source VARCHAR(50),
      IN p_payload JSON
    )
    BEGIN
      DECLARE new_id CHAR(64);
      SET new_id = UUID();
      INSERT INTO webhook_event (id, event_id, event_type, source, payload)
      VALUES (new_id, p_event_id, p_event_type, p_source, p_payload);
      SELECT * FROM webhook_event WHERE id = new_id;
    END;
  `);

  // GetWebhookEventById - Retrieve webhook event by internal ID
  await sequelize.query(`
    CREATE PROCEDURE GetWebhookEventById(IN p_id CHAR(64))
    BEGIN
      SELECT * FROM webhook_event WHERE id = p_id;
    END;
  `);

  // GetWebhookEventByEventId - Retrieve webhook event by external event ID
  await sequelize.query(`
    CREATE PROCEDURE GetWebhookEventByEventId(IN p_event_id VARCHAR(255))
    BEGIN
      SELECT * FROM webhook_event WHERE event_id = p_event_id;
    END;
  `);

  // MarkWebhookEventProcessed - Mark a webhook event as successfully processed
  await sequelize.query(`
    CREATE PROCEDURE MarkWebhookEventProcessed(IN p_id CHAR(64))
    BEGIN
      UPDATE webhook_event SET
        status = 'processed',
        processed_at = NOW()
      WHERE id = p_id;
      SELECT * FROM webhook_event WHERE id = p_id;
    END;
  `);

  // MarkWebhookEventFailed - Mark a webhook event as failed with error message
  await sequelize.query(`
    CREATE PROCEDURE MarkWebhookEventFailed(IN p_id CHAR(64), IN p_error_message TEXT)
    BEGIN
      UPDATE webhook_event SET
        status = 'failed',
        error_message = p_error_message
      WHERE id = p_id;
      SELECT * FROM webhook_event WHERE id = p_id;
    END;
  `);

  // GetPendingWebhookEvents - Retrieve all pending webhook events for processing
  await sequelize.query(`
    CREATE PROCEDURE GetPendingWebhookEvents()
    BEGIN
      SELECT * FROM webhook_event WHERE status = 'pending' ORDER BY created_at ASC;
    END;
  `);

  // GetWebhookEventsBySource - Retrieve webhook events by source (e.g., paymongo, stripe)
  await sequelize.query(`
    CREATE PROCEDURE GetWebhookEventsBySource(IN p_source VARCHAR(50))
    BEGIN
      SELECT * FROM webhook_event WHERE source = p_source ORDER BY created_at DESC;
    END;
  `);

  console.log('Webhook event procedures created.');
}

/**
 * Drop all webhook event-related stored procedures
 * @param {import('sequelize').Sequelize} sequelize - Sequelize instance
 */
export async function dropWebhookEventProcedures(sequelize) {
  await sequelize.query('DROP PROCEDURE IF EXISTS InsertWebhookEvent;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetWebhookEventById;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetWebhookEventByEventId;');
  await sequelize.query('DROP PROCEDURE IF EXISTS MarkWebhookEventProcessed;');
  await sequelize.query('DROP PROCEDURE IF EXISTS MarkWebhookEventFailed;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetPendingWebhookEvents;');
  await sequelize.query('DROP PROCEDURE IF EXISTS GetWebhookEventsBySource;');

  console.log('Webhook event procedures dropped.');
}
