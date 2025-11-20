const { createTouristSpotApprovalProcedures, dropTouristSpotApprovalProcedures } = require('../procedures/approvalProcedures');

exports.up = async function(knex) {
  await createTouristSpotApprovalProcedures(knex);
};

exports.down = async function(knex) {
  await dropTouristSpotApprovalProcedures(knex);
};
