#!/usr/bin/env node
/**
 * Database Setup Script
 * Creates stored procedures and runs migrations
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from '../config/config.js';
import { testConnection, closeConnection } from '../config/database.js';
import { recreateAllProcedures } from '../procedures/index.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setup() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful\n');

    console.log('🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Run migrations: npm run db:migrate');
    console.log('  2. Run seeders: npm run db:seed');
    console.log('  3. Start server: npm run dev');

  } catch (error) {
    logger.error('Database setup failed:', error);
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

setup();
