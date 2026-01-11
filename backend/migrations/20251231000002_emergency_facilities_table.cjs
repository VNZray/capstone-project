/**
 * Emergency Facilities Table Migration
 * Stores emergency facilities like police stations, hospitals, fire stations, and evacuation centers
 */

const {
  createEmergencyFacilityProcedures,
  dropEmergencyFacilityProcedures,
} = require("../procedures/emergency/emergency-facility.procedures.cjs");

exports.up = async function(knex) {
  await knex.schema.createTable('emergency_facilities', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.string('name', 255).notNullable();
    table.text('description').nullable();
    table.enu('facility_type', ['police_station', 'hospital', 'fire_station', 'evacuation_center'])
      .notNullable();
    table.integer('barangay_id').unsigned().notNullable()
      .references('id').inTable('barangay')
      .onDelete('RESTRICT').onUpdate('CASCADE');
    table.text('address').nullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.string('contact_phone', 20).nullable();
    table.string('contact_email', 255).nullable();
    table.string('emergency_hotline', 20).nullable();
    table.text('operating_hours').nullable();
    table.string('facility_image', 500).nullable();
    table.enu('status', ['active', 'inactive', 'under_maintenance']).notNullable().defaultTo('active');
    table.integer('capacity').unsigned().nullable().comment('For evacuation centers');
    table.text('services_offered').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

    // Indexes for performance
    table.index('facility_type', 'idx_facility_type');
    table.index('barangay_id', 'idx_barangay');
    table.index('status', 'idx_status');
    table.index(['latitude', 'longitude'], 'idx_coordinates');
  });

  console.log("Emergency facilities table created.");

  // Create stored procedures
  await createEmergencyFacilityProcedures(knex);
  console.log("Emergency facilities stored procedures created.");
};

exports.down = async function(knex) {
  // Drop stored procedures first
  await dropEmergencyFacilityProcedures(knex);
  console.log("Emergency facilities stored procedures dropped.");

  await knex.schema.dropTableIfExists('emergency_facilities');
};
