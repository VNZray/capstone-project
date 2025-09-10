const { createApprovalRecordProcedures, dropApprovalRecordProcedures } = require('../procedures/touristSpotProcedures.js');

exports.up = async function(knex) {
  await createApprovalRecordProcedures(knex);
};

exports.down = async function(knex) {
  await dropApprovalRecordProcedures(knex);
};
