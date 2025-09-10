const { createTouristSpotEditProcedures, dropTouristSpotEditProcedures } = require("../procedures/touristSpotProcedures");

exports.up = async function(knex) {
  await createTouristSpotEditProcedures(knex);
};

exports.down = async function(knex) {
  await dropTouristSpotEditProcedures(knex);
};
