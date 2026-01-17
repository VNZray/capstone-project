// Migration for all tourist spot and approval procedures
const {createCategoriesProcedures,dropCategoriesProcedures} = require('../procedures/touristSpot/categories.procedures.cjs');
const {createTouristSpotEditProcedures,dropTouristSpotEditProcedures} = require('../procedures/touristSpot/edit-request.procedures.cjs');
const {createImageProcedures,dropImageProcedures} = require('../procedures/touristSpot/image.procedures.cjs');
const {createLocationProcedures,dropLocationProcedures} = require('../procedures/touristSpot/location.procedures.cjs');
const {createScheduleProcedures,dropScheduleProcedures} = require('../procedures/touristSpot/schedule.procedures.cjs');
const {createTouristSpotProcedures,dropTouristSpotProcedures} = require('../procedures/touristSpot/tourist-spot.procedures.cjs');
const {createApprovalRecordProcedures,dropApprovalRecordProcedures} = require('../procedures/approval/approval-record.procedures.cjs');

exports.up = async function(knex) {
  await createCategoriesProcedures(knex);
  await createTouristSpotEditProcedures(knex);
  await createImageProcedures(knex);
  await createLocationProcedures(knex);
  await createScheduleProcedures(knex);
  await createTouristSpotProcedures(knex);
  await createApprovalRecordProcedures(knex);

  console.log("Tourist spot and approval procedures created.");
};

exports.down = async function(knex) {
  await dropCategoriesProcedures(knex);
  await dropTouristSpotEditProcedures(knex);
  await dropImageProcedures(knex);
  await dropLocationProcedures(knex);
  await dropScheduleProcedures(knex);
  await dropTouristSpotProcedures(knex);
  await dropApprovalRecordProcedures(knex);
};
