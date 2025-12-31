#!/usr/bin/env node
/**
 * Database Reset Script
 * Drops database, creates new database, runs migrations, stored procedures, and seeds
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import config from '../config/config.js';
import logger from '../config/logger.js';
import { recreateAllProcedures } from '../procedures/index.js';

const execAsync = promisify(exec);

/**
 * Create Sequelize instance for procedure migration
 */
function createSequelizeInstance() {
  return new Sequelize(config.db.name, config.db.user, config.db.password, {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    timezone: config.db.timezone,
    logging: false
  });
}

async function resetDatabase() {
  console.log('🔄 Resetting database...\n');
  console.log('⚠️  WARNING: This will DELETE the entire database and recreate it!\n');

  let connection;
  let sequelize;

  try {
    // Connect to MySQL without specifying a database
    console.log('🔌 Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password
    });
    console.log('✅ Connected to MySQL server\n');

    // Drop database if exists
    console.log(`🗑️  Dropping database "${config.db.name}" if exists...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${config.db.name}\``);
    console.log('✅ Database dropped\n');

    // Create new database
    console.log(`📦 Creating database "${config.db.name}"...`);
    await connection.query(`CREATE DATABASE \`${config.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ Database created\n');

    // Close the connection
    await connection.end();
    connection = null;

    // Run migrations
    console.log('📥 Running migrations...');
    const { stdout: migrateOut } = await execAsync('npx sequelize-cli db:migrate');
    if (migrateOut) console.log(migrateOut);
    console.log('✅ Migrations completed\n');

    // Run stored procedures migration
    console.log('📦 Creating stored procedures...');
    sequelize = createSequelizeInstance();
    await sequelize.authenticate();
    await recreateAllProcedures(sequelize);
    await sequelize.close();
    sequelize = null;
    console.log('✅ Stored procedures created\n');

    // Run seeders
    console.log('🌱 Running seeders...');
    const { stdout: seedOut } = await execAsync('npx sequelize-cli db:seed:all');
    if (seedOut) console.log(seedOut);
    console.log('✅ Seeders completed\n');

    console.log('🎉 Database reset successfully!');

  } catch (error) {
    logger.error('Database reset failed:', error);
    console.error('\n❌ Reset failed:', error.message);
    if (error.stdout) console.error('stdout:', error.stdout);
    if (error.stderr) console.error('stderr:', error.stderr);
    process.exit(1);
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Connection already closed
      }
    }
    if (sequelize) {
      try {
        await sequelize.close();
      } catch (e) {
        // Connection already closed
      }
    }
  }
}

resetDatabase();
