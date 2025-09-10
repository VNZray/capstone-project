exports.up = function(knex) {
  return knex.schema.createTable('tourist_spots', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.string('name', 255).notNullable();
    table.text('description').notNullable();
    table.integer('address_id').unsigned().notNullable().references('id').inTable('address').onDelete('CASCADE').onUpdate('CASCADE');
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.string('contact_phone', 20).nullable();
    table.string('contact_email', 255).nullable();
    table.string('website', 255).nullable();
    table.decimal('entry_fee', 10, 2).nullable();
    table.enu('spot_status', ['pending', 'active', 'inactive']).notNullable().defaultTo('pending');
    table.boolean('is_featured').defaultTo(0);
    table.integer('type_id').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    // indexes
    table.index('type_id', 'idx_type');
    table.index('address_id', 'idx_address');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tourist_spots');
};
