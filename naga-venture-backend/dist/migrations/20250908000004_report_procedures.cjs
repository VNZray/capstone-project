const { 
  createReportProcedures, 
  dropReportProcedures 
} = require("../procedures/reportProcedures");

exports.up = async function(knex) {
  await createReportProcedures(knex);
};

exports.down = async function(knex) {
  await dropReportProcedures(knex);
};
