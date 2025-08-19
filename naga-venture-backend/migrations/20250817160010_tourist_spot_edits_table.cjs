exports.up = function(knex) {
  return knex.schema.createTable('tourist_spot_edits', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('tourist_spot_id').notNullable().references('id').inTable('tourist_spots').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.text('description').notNullable();
    table.integer('province_id').notNullable();
    table.integer('municipality_id').notNullable();
    table.integer('barangay_id').notNullable();
    table.decimal('latitude', 10, 8).nullable();
    table.decimal('longitude', 11, 8).nullable();
    table.string('contact_phone', 20).notNullable();
    table.string('contact_email', 255).nullable();
    table.string('website', 255).nullable();
    table.decimal('entry_fee', 10, 2).nullable();
    table.enu('spot_status', ['pending', 'active', 'inactive']).notNullable().defaultTo('pending');
    table.boolean('is_featured').defaultTo(0);
    table.integer('category_id').notNullable();
    table.integer('type_id').notNullable();
    table.enu('approval_status', ['pending', 'approved', 'rejected']).notNullable().defaultTo('pending');
    table.string('remarks', 255).notNullable().defaultTo('');
    table.timestamp('submitted_at').defaultTo(knex.fn.now());
    table.timestamp('reviewed_at').nullable();

  // indexes (match SQL dump)
  table.index('tourist_spot_id', 'idx_tourist_spot');
  table.index('category_id', 'idx_category');
  table.index('type_id', 'idx_type');
  table.index('province_id', 'idx_province');
  table.index('municipality_id', 'idx_municipality');
  table.index('barangay_id', 'idx_barangay');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tourist_spot_edits');
};
