/**
 * Migration: Create order_audit table
 * 
 * This table provides persistent audit logging for all order lifecycle events.
 * Required by spec.md: "Log order lifecycle events, actor, timestamp, and IP"
 * 
 * @see docs/ORDERING_SYSTEM_AUDIT.md - Phase 2
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('order_audit', (table) => {
    // Primary key
    table.increments('id').primary();
    
    // Reference to the order being audited (UUID to match order.id)
    table.uuid('order_id').notNullable();
    
    // Event classification
    table.string('event_type', 50).notNullable()
      .comment('Event type: created, status_changed, payment_updated, cancelled, refunded, picked_up, arrival_verified');
    
    // State change tracking
    table.string('old_value', 100).nullable()
      .comment('Previous value (e.g., old status)');
    table.string('new_value', 100).nullable()
      .comment('New value (e.g., new status)');
    
    // Actor information (who triggered the event) - UUID to match user.id
    table.uuid('actor_id').nullable()
      .comment('User ID who triggered the event (null for system events)');
    table.string('actor_role', 50).nullable()
      .comment('Role of the actor: Tourist, Business Owner, Staff, Admin, System');
    table.string('actor_ip', 45).nullable()
      .comment('IP address of the actor (supports IPv6)');
    
    // Additional context
    table.text('metadata').nullable()
      .comment('JSON string with additional event context');
    
    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now())
      .comment('When the event occurred');
    
    // Foreign key constraint
    table.foreign('order_id')
      .references('id')
      .inTable('order')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    // Indexes for common queries
    table.index(['order_id', 'created_at'], 'idx_order_audit_order_timeline');
    table.index('event_type', 'idx_order_audit_event_type');
    table.index('actor_id', 'idx_order_audit_actor');
    table.index('created_at', 'idx_order_audit_created');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('order_audit');
};
