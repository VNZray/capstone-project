exports.up = function(knex) {
  return knex.schema.createTable('tourist_spot_schedules', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('tourist_spot_id').notNullable().references('id').inTable('tourist_spots').onDelete('CASCADE');
    table.integer('day_of_week').notNullable();
    table.time('open_time').nullable();
    table.time('close_time').nullable();
    table.boolean('is_closed').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    // indexes
    table.index('tourist_spot_id', 'idx_tourist_spot');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tourist_spot_schedules');
};
