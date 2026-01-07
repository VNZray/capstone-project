exports.up = async function(knex) {
  await knex.schema.createTable('tourist_spot_edits', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('tourist_spot_id').notNullable().references('id').inTable('tourist_spots').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.text('description').notNullable();
    table.integer('barangay_id').unsigned().notNullable().references('id').inTable('barangay').onDelete('RESTRICT').onUpdate('CASCADE');
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.string('contact_phone', 20).notNullable();
    table.string('contact_email', 255).nullable();
    table.string('website', 255).nullable();
    table.decimal('entry_fee', 10, 2).nullable();
    table.enu('spot_status', ['pending', 'active', 'inactive']).notNullable().defaultTo('pending');
    table.boolean('is_featured').defaultTo(0);
    // Note: type_id removed - using entity_categories table instead
    table.enu('approval_status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.string('remarks', 255).notNullable().defaultTo('');
    table.uuid('submitted_by').nullable();
    table.timestamp('submitted_at').defaultTo(knex.fn.now());
    table.timestamp('reviewed_at').nullable();

    // indexes
    table.index('tourist_spot_id', 'idx_tourist_spot');
    table.index('barangay_id', 'idx_barangay');
  });

  console.log("Tourist spot edits table created.");
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('tourist_spot_edits');
};
