/**
 * Graceful Shutdown Handler
 * Ensures proper cleanup when the server is shutting down
 */
import logger from '../config/logger.js';
import { closeConnection } from '../config/database.js';

let isShuttingDown = false;

/**
 * Perform graceful shutdown
 * @param {Object} server - HTTP server instance
 * @param {string} signal - Signal that triggered shutdown
 */
const gracefulShutdown = async (server, signal) => {
  if (isShuttingDown) {
    logger.info('Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  // Give ongoing requests time to complete
  const shutdownTimeout = 30000; // 30 seconds

  const forceShutdown = setTimeout(() => {
    logger.error('Forceful shutdown after timeout');
    process.exit(1);
  }, shutdownTimeout);

  try {
    // Stop accepting new connections
    if (server) {
      await new Promise((resolve) => {
        server.close((err) => {
          if (err) {
            logger.error('Error closing server:', err);
          } else {
            logger.info('Server stopped accepting new connections');
          }
          resolve();
        });
      });
    }

    // Close database connection
    await closeConnection();
    logger.info('Database connection closed');

    // Clear timeout and exit
    clearTimeout(forceShutdown);
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    clearTimeout(forceShutdown);
    process.exit(1);
  }
};

/**
 * Setup graceful shutdown handlers
 * @param {Object} server - HTTP server instance
 */
export const setupGracefulShutdown = (server) => {
  // Handle termination signals
  process.on('SIGTERM', () => gracefulShutdown(server, 'SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown(server, 'SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown(server, 'uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown(server, 'unhandledRejection');
  });
};

export default { setupGracefulShutdown };
