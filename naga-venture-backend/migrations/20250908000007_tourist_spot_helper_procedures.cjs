const { createTouristSpotAdditionalHelpers, dropTouristSpotAdditionalHelpers } = require("../procedures/touristSpotProcedures");

exports.up = async function(knex) {
  await createTouristSpotAdditionalHelpers(knex);
};

exports.down = async function(knex) {
  await dropTouristSpotAdditionalHelpers(knex);
};
