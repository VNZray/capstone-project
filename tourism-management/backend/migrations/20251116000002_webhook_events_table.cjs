
exports.up = async function (knex) {
  await knex.schema.createTable("webhook_event", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"));
    table.string("provider", 50).notNullable(); // 'paymongo'
    table.string("provider_event_id", 255).notNullable().unique(); // PayMongo event ID for idempotency
    table.string("event_type", 100).notNullable(); // e.g., 'source.chargeable', 'payment.paid'
    table.boolean("livemode").defaultTo(false);
    table.json("payload").notNullable(); // Full webhook payload
    table.enu("status", ["pending", "processed", "failed"]).defaultTo("pending");
    table.text("error_message").nullable();
    table.timestamp("processed_at").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    
    // Indices for lookups and deduplication
    table.index("provider_event_id", "idx_webhook_provider_event");
    table.index(["provider", "event_type"], "idx_webhook_provider_type");
    table.index("status", "idx_webhook_status");
    table.index("created_at", "idx_webhook_created");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("webhook_event");
};
