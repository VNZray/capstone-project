const { createTouristSpotProcedures, dropTouristSpotProcedures } = require("../procedures/touristSpotProcedures");

exports.up = async function(knex) {
  await createTouristSpotProcedures(knex);
};

exports.down = async function(knex) {
  await dropTouristSpotProcedures(knex);
};
