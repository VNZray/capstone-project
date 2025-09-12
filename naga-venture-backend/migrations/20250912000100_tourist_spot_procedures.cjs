// migrations/20250912000100_tourist_spot_procedures.cjs
// Migration for all tourist spot and approval procedures
const {createCategoriesProcedures,dropCategoriesProcedures} = require('../procedures/touristSpot/categoriesProcedures');
const {createTouristSpotEditProcedures,dropTouristSpotEditProcedures} = require('../procedures/touristSpot/editRequestProcedures');
const {createImageProcedures,dropImageProcedures} = require('../procedures/touristSpot/imageProcedures');
const {createLocationProcedures,dropLocationProcedures} = require('../procedures/touristSpot/locationProcedures');
const {createScheduleProcedures,dropScheduleProcedures} = require('../procedures/touristSpot/scheduleProcedures');
const {createTouristSpotProcedures,dropTouristSpotProcedures} = require('../procedures/touristSpot/touristSpotProcedures');
const {createTouristSpotAdditionalHelpers,dropTouristSpotAdditionalHelpers} = require('../procedures/touristSpot/additionalHelpers');
const {createTouristSpotApprovalProcedures,dropTouristSpotApprovalProcedures} = require('../procedures/approvalProcedures');
const {createApprovalRecordProcedures,dropApprovalRecordProcedures} = require('../procedures/approvalRecordProcedures');

exports.up = async function(knex) {
  await createCategoriesProcedures(knex);
  await createTouristSpotEditProcedures(knex);
  await createImageProcedures(knex);
  await createLocationProcedures(knex);
  await createScheduleProcedures(knex);
  await createTouristSpotProcedures(knex);
  await createTouristSpotAdditionalHelpers(knex);
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
  await dropTouristSpotAdditionalHelpers(knex);
  await dropTouristSpotApprovalProcedures(knex);
  await dropApprovalRecordProcedures(knex);
};
