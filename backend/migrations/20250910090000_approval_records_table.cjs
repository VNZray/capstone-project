exports.up = async function(knex) {
  await knex.schema.createTable('approval_records', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.enu('approval_type', ['edit', 'new']).notNullable();
    table.enu('subject_type', ['tourist_spot', 'business', 'accommodation', 'event']).notNullable();
    table.uuid('subject_id').notNullable();
    table.enu('decision', ['approved', 'rejected']).notNullable();
    table.uuid('decided_by').nullable(); // Optionally link to user table
    table.timestamp('decided_at').defaultTo(knex.fn.now());
    table.text('remarks').nullable();
  });

  console.log('Approval records table created.');
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('approval_records');
};
