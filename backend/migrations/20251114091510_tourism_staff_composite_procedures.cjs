const { createTourismCompositeProcedures, dropTourismCompositeProcedures } = require('../procedures/auth/tourismCompositeProcedures');

exports.up = async function(knex) {
  await createTourismCompositeProcedures(knex);
};

exports.down = async function(knex) {
  await dropTourismCompositeProcedures(knex);
};
