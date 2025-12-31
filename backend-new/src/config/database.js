/**
 * Sequelize Database Connection (ESM)
 * Primary database connection module for the application
 */
import { Sequelize } from 'sequelize';
import config from './config.js';
import logger from './logger.js';

const { db } = config;

const sequelize = new Sequelize(db.name, db.user, db.password, {
  host: db.host,
  port: db.port,
  dialect: db.dialect,
  timezone: db.timezone,
  pool: db.pool,
  logging: db.logging ? (msg) => logger.debug(msg) : false,
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  dialectOptions: {
    dateStrings: true,
    typeCast: true
  }
});

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error.message);
    throw error;
  }
};

/**
 * Sync database models (use with caution in production)
 */
export const syncDatabase = async (options = {}) => {
  try {
    if (config.isProd && options.force) {
      throw new Error('Cannot force sync in production environment');
    }
    await sequelize.sync(options);
    logger.info('✅ Database synchronized successfully');
    return true;
  } catch (error) {
    logger.error('❌ Database sync failed:', error.message);
    throw error;
  }
};

/**
 * Close database connection gracefully
 */
export const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error.message);
    throw error;
  }
};

export default sequelize;
