/**
 * Event multi-category and multi-location support migration
 * Adds junction tables for multiple categories and multiple locations per event
 */
exports.up = async function(knex) {
  // Create event_category_mapping table for multiple categories
  await knex.schema.createTable('event_category_mapping', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE').onUpdate('CASCADE');
    table.uuid('category_id').notNullable().references('id').inTable('event_categories').onDelete('CASCADE').onUpdate('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Unique constraint to prevent duplicate category assignments
    table.unique(['event_id', 'category_id'], 'uk_event_category');
    table.index('event_id', 'idx_ecm_event');
    table.index('category_id', 'idx_ecm_category');
  });
  console.log("Event category mapping table created.");

  // Create event_locations table for multiple locations
  await knex.schema.createTable('event_locations', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE').onUpdate('CASCADE');
    table.string('venue_name', 255).notNullable();
    table.text('venue_address').nullable();
    table.integer('barangay_id').unsigned().nullable().references('id').inTable('barangay').onDelete('SET NULL').onUpdate('CASCADE');
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.boolean('is_primary').defaultTo(false);
    table.integer('display_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    table.index('event_id', 'idx_el_event');
    table.index('barangay_id', 'idx_el_barangay');
  });
  console.log("Event locations table created.");

  // Migrate existing event data to the new tables
  // Get all events with category_id
  const eventsWithCategories = await knex('events')
    .whereNotNull('category_id')
    .select('id', 'category_id');
  
  if (eventsWithCategories.length > 0) {
    const categoryMappings = eventsWithCategories.map(e => ({
      event_id: e.id,
      category_id: e.category_id
    }));
    await knex('event_category_mapping').insert(categoryMappings);
    console.log(`Migrated ${categoryMappings.length} event-category mappings.`);
  }

  // Get all events with location data
  const eventsWithLocations = await knex('events')
    .whereNotNull('venue_name')
    .orWhereNotNull('barangay_id')
    .select('id', 'venue_name', 'venue_address', 'barangay_id', 'latitude', 'longitude');
  
  if (eventsWithLocations.length > 0) {
    const locationData = eventsWithLocations
      .filter(e => e.venue_name || e.barangay_id)
      .map(e => ({
        event_id: e.id,
        venue_name: e.venue_name || 'Primary Location',
        venue_address: e.venue_address,
        barangay_id: e.barangay_id,
        latitude: e.latitude,
        longitude: e.longitude,
        is_primary: true,
        display_order: 0
      }));
    
    if (locationData.length > 0) {
      await knex('event_locations').insert(locationData);
      console.log(`Migrated ${locationData.length} event locations.`);
    }
  }

  console.log("Event multi-category and multi-location migration complete.");
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('event_locations');
  await knex.schema.dropTableIfExists('event_category_mapping');
};
