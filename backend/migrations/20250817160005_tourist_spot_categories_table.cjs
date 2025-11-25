exports.up = async function(knex) {
  await knex.schema.createTable('tourist_spot_categories', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('tourist_spot_id').notNullable().references('id').inTable('tourist_spots').onDelete('CASCADE');
    table.integer('category_id').unsigned().notNullable().references('id').inTable('category').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Ensure unique combination of tourist_spot_id and category_id
    table.unique(['tourist_spot_id', 'category_id'], 'ts_cat_unique');
    
    // Indexes for performance
    table.index('tourist_spot_id', 'idx_tourist_spot_id');
    table.index('category_id', 'idx_category_id');
  });

  console.log("Tourist spot categories table created.");
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('tourist_spot_categories');
};
