#!/usr/bin/env node
/**
 * Create/Migrate Stored Procedures Script
 * Drops existing procedures and recreates them from procedure modules
 *
 * Usage:
 *   npm run db:procedures         - Recreate all procedures
 *   npm run db:procedures:create  - Create procedures only (skip drop)
 *   npm run db:procedures:drop    - Drop procedures only
 */

import sequelize from '../config/database.js';
import { createAllProcedures, dropAllProcedures, recreateAllProcedures } from '../procedures/index.js';
import logger from '../config/logger.js';

const ACTIONS = {
  RECREATE: 'recreate',
  CREATE: 'create',
  DROP: 'drop'
};

async function migrateProcedures(action = ACTIONS.RECREATE) {
  console.log('🔄 Stored Procedures Migration\n');
  console.log(`Action: ${action.toUpperCase()}\n`);

  try {
    // Test database connection
    console.log('📡 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    switch (action) {
      case ACTIONS.CREATE:
        await createAllProcedures(sequelize);
        break;
      case ACTIONS.DROP:
        await dropAllProcedures(sequelize);
        break;
      case ACTIONS.RECREATE:
      default:
        await recreateAllProcedures(sequelize);
        break;
    }

    console.log('\n🎉 Procedure migration completed successfully!');

  } catch (error) {
    logger.error('Procedure migration failed:', error);
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
      console.log('\n📴 Database connection closed');
    } catch (e) {
      // Connection already closed
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let action = ACTIONS.RECREATE;

if (args.includes('--create') || args.includes('-c')) {
  action = ACTIONS.CREATE;
} else if (args.includes('--drop') || args.includes('-d')) {
  action = ACTIONS.DROP;
}

migrateProcedures(action);
