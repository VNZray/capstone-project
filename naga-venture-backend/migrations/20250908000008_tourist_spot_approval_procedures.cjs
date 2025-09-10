const { createTouristSpotApprovalProcedures, dropTouristSpotApprovalProcedures } = require("../procedures/touristSpotProcedures");

exports.up = async function(knex) {
  await createTouristSpotApprovalProcedures(knex);
};

exports.down = async function(knex) {
  await dropTouristSpotApprovalProcedures(knex);
};
