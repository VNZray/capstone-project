const { createTouristSpotApprovalProcedures, dropTouristSpotApprovalProcedures } = require('../procedures/approval/approval.procedures.cjs');

exports.up = async function(knex) {
  await createTouristSpotApprovalProcedures(knex);
};

exports.down = async function(knex) {
  await dropTouristSpotApprovalProcedures(knex);
};
