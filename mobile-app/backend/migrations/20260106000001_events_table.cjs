/**
 * Events table migration
 * Creates the events table for tourism event management
 */

const eventProcedures = require("../procedures/event/events-procedures.cjs");

exports.up = async function(knex) {
  // Create event_categories table first
  await knex.schema.createTable('event_categories', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('name', 100).notNullable().unique();
    table.text('description').nullable();
    table.string('icon', 50).nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
  console.log("Event categories table created.");

  // Create events table
  await knex.schema.createTable('events', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.uuid('category_id').nullable().references('id').inTable('event_categories').onDelete('SET NULL').onUpdate('CASCADE');

    // Venue/Location
    table.string('venue_name', 255).nullable();
    table.text('venue_address').nullable();
    table.integer('barangay_id').unsigned().nullable().references('id').inTable('barangay').onDelete('SET NULL').onUpdate('CASCADE');
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();

    // Event timing
    table.date('start_date').notNullable();
    table.date('end_date').nullable();
    table.time('start_time').nullable();
    table.time('end_time').nullable();
    table.boolean('is_all_day').defaultTo(false);
    table.boolean('is_recurring').defaultTo(false);
    table.string('recurrence_pattern', 50).nullable(); // daily, weekly, monthly, yearly

    // Pricing & capacity
    table.decimal('ticket_price', 10, 2).nullable();
    table.boolean('is_free').defaultTo(true);
    table.integer('max_capacity').nullable();
    table.integer('current_attendees').defaultTo(0);

    // Contact
    table.string('contact_phone', 20).nullable();
    table.string('contact_email', 255).nullable();
    table.string('website', 255).nullable();
    table.string('registration_url', 500).nullable();

    // Media
    table.string('cover_image_url', 500).nullable();
    table.json('gallery_images').nullable();

    // Status and visibility
    table.enu('status', ['draft', 'pending', 'approved', 'rejected', 'published', 'cancelled', 'completed', 'archived'])
      .notNullable()
      .defaultTo('pending');
    table.boolean('is_featured').defaultTo(false);
    table.integer('featured_order').nullable();

    // Organizer
    table.uuid('organizer_id').nullable();
    table.string('organizer_name', 255).nullable();
    table.string('organizer_type', 50).nullable(); // tourism_office, business, community

    // Audit
    table.uuid('submitted_by').nullable();
    table.uuid('approved_by').nullable();
    table.timestamp('approved_at').nullable();
    table.text('rejection_reason').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    // Indexes
    table.index('category_id', 'idx_event_category');
    table.index('status', 'idx_event_status');
    table.index('start_date', 'idx_event_start_date');
    table.index('is_featured', 'idx_event_featured');
    table.index('barangay_id', 'idx_event_barangay');
  });
  console.log("Events table created.");

  // Create event_images table for additional event images
  await knex.schema.createTable('event_images', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('file_url', 500).notNullable();
    table.string('file_format', 20).nullable();
    table.integer('file_size').nullable();
    table.boolean('is_primary').defaultTo(false);
    table.string('alt_text', 255).nullable();
    table.integer('display_order').defaultTo(0);
    table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    table.index('event_id', 'idx_event_images_event');
  });
  console.log("Event images table created.");

  // Seed default event categories
  await knex('event_categories').insert([
    { name: 'Festival', description: 'Local festivals and cultural celebrations', icon: 'celebration' },
    { name: 'Concert', description: 'Music concerts and live performances', icon: 'music_note' },
    { name: 'Sports', description: 'Sports events and competitions', icon: 'sports' },
    { name: 'Workshop', description: 'Educational workshops and seminars', icon: 'school' },
    { name: 'Exhibition', description: 'Art exhibitions and trade shows', icon: 'palette' },
    { name: 'Community', description: 'Community gatherings and meetings', icon: 'groups' },
    { name: 'Food & Dining', description: 'Food festivals and culinary events', icon: 'restaurant' },
    { name: 'Nature & Adventure', description: 'Outdoor activities and nature events', icon: 'nature' },
    { name: 'Religious', description: 'Religious ceremonies and observances', icon: 'church' },
    { name: 'Other', description: 'Other events', icon: 'event' },
  ]);
  console.log("Default event categories seeded.");

  // Create stored procedures
  await eventProcedures.up(knex);
  console.log("Event stored procedures created.");
};

exports.down = async function(knex) {
  // Drop stored procedures
  await eventProcedures.down(knex);
  console.log("Event stored procedures dropped.");

  await knex.schema.dropTableIfExists('event_images');
  await knex.schema.dropTableIfExists('events');
  await knex.schema.dropTableIfExists('event_categories');
};
