const fs = require('fs');
const path = require('path');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Helper function to read and execute SQL files
  const executeSqlFile = async (filename) => {
    const filePath = path.join(__dirname, '..', 'procedures', filename);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Remove DELIMITER statements and split by the custom delimiter $$
    const cleanSql = sql.replace(/DELIMITER \$\$/g, '').replace(/DELIMITER ;/g, '');
    const statements = cleanSql.split('$$').filter(statement => statement.trim() && !statement.trim().startsWith('--'));
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement && !trimmedStatement.startsWith('--')) {
        try {
          await knex.raw(trimmedStatement);
        } catch (error) {
          console.error(`Error executing statement: ${trimmedStatement.substring(0, 100)}...`);
          throw error;
        }
      }
    }
  };

  // Execute all stored procedure files
  const procedureFiles = [
    'tourist_spot_procedures.sql',
    'approval_procedures.sql',
    'report_procedures.sql'
  ];

  for (const file of procedureFiles) {
    try {
      await executeSqlFile(file);
      console.log(`Executed stored procedures from ${file}`);
    } catch (error) {
      console.error(`Error executing ${file}:`, error);
      throw error;
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop all stored procedures
  const procedures = [
    // Tourist Spot Procedures
    'GetAllTouristSpots',
    'GetTouristSpotById',
    'CreateTouristSpot',
    'UpdateTouristSpot',
    'DeleteTouristSpot',
    'SubmitEditRequest',
    'GetTouristSpotCategories',
    'UpdateTouristSpotCategories',
    
    // Approval Procedures
    'GetPendingEditRequests',
    'GetPendingTouristSpots',
    'ApproveTouristSpot',
    'ApproveEditRequest',
    'RejectEditRequest',
    'RejectTouristSpot',
    
    // Report Procedures
    'GetAllReports',
    'GetReportById',
    'GetReportsByReporterId',
    'CreateReport',
    'UpdateReportStatus',
    'DeleteReport',
    'GetReportsByTarget',
    'GetReportsByStatus'
  ];

  for (const procedure of procedures) {
    await knex.raw(`DROP PROCEDURE IF EXISTS ${procedure}`);
  }
};
