exports.up = async function(knex) {
  const {
    createRefreshTokenProcedures,
    dropRefreshTokenProcedures,
  } = require("../procedures/auth/refresh-token.procedures.cjs");
  await knex.schema.createTable('refresh_tokens', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('(UUID())'));
    table.string('token_hash').notNullable();
    table.uuid('user_id').references('id').inTable('user').onDelete('CASCADE');
    table.timestamp('expires_at').notNullable();
    table.boolean('revoked').defaultTo(false);
    table.uuid('family_id').notNullable(); // Used for rotation groups
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await createRefreshTokenProcedures(knex);
};

exports.down = async function(knex) {
  const {
    dropRefreshTokenProcedures,
  } = require("../procedures/auth/refresh-token.procedures.cjs");
  await knex.schema.dropTable('refresh_tokens');
  await dropRefreshTokenProcedures(knex);
};
