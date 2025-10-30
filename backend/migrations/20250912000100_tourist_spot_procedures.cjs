// Migration for all tourist spot and approval procedures
const {createCategoriesProcedures,dropCategoriesProcedures} = require('../procedures/touristSpot/categoriesProcedures');
const {createTouristSpotEditProcedures,dropTouristSpotEditProcedures} = require('../procedures/touristSpot/editRequestProcedures');
const {createImageProcedures,dropImageProcedures} = require('../procedures/touristSpot/imageProcedures');
const {createLocationProcedures,dropLocationProcedures} = require('../procedures/touristSpot/locationProcedures');
const {createScheduleProcedures,dropScheduleProcedures} = require('../procedures/touristSpot/scheduleProcedures');
const {createTouristSpotProcedures,dropTouristSpotProcedures} = require('../procedures/touristSpot/touristSpotProcedures');
const {createTouristSpotApprovalProcedures,dropTouristSpotApprovalProcedures} = require('../procedures/approvalProcedures');
const {createApprovalRecordProcedures,dropApprovalRecordProcedures} = require('../procedures/approvalRecordProcedures');

exports.up = async function(knex) {
  await createCategoriesProcedures(knex);
  await createTouristSpotEditProcedures(knex);
  await createImageProcedures(knex);
  await createLocationProcedures(knex);
  await createScheduleProcedures(knex);
  await createTouristSpotProcedures(knex);
  await createTouristSpotApprovalProcedures(knex);
  await createApprovalRecordProcedures(knex);
};

exports.down = async function(knex) {
  await dropCategoriesProcedures(knex);
  await dropTouristSpotEditProcedures(knex);
  await dropImageProcedures(knex);
  await dropLocationProcedures(knex);
  await dropScheduleProcedures(knex);
  await dropTouristSpotProcedures(knex);
  await dropTouristSpotApprovalProcedures(knex);
  await dropApprovalRecordProcedures(knex);
};
