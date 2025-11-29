/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable('booking', function (table) {
    table.enum('booking_type', ['overnight', 'short-stay']).defaultTo('overnight').after('booking_status');
    table.integer('booking_hours').unsigned().nullable().after('booking_type').comment('Number of hours for short-stay bookings');
    table.time('check_in_time').nullable().after('booking_hours').comment('Check-in time for overnight stays');
    table.time('check_out_time').nullable().after('check_in_time').comment('Check-out time for overnight stays');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable('booking', function (table) {
    table.dropColumn('booking_type');
    table.dropColumn('booking_hours');
    table.dropColumn('check_in_time');
    table.dropColumn('check_out_time');
  });
};
