const { createTourismCompositeProcedures, dropTourismCompositeProcedures } = require('../procedures/auth/tourism-composite.procedures.cjs');

exports.up = async function(knex) {
  await createTourismCompositeProcedures(knex);
};

exports.down = async function(knex) {
  await dropTourismCompositeProcedures(knex);
};
