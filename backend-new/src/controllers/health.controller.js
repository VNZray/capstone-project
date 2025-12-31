/**
 * Health Controller
 * API health check endpoints
 */
import { testConnection } from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Basic health check
 */
export const getHealth = async (req, res) => {
  res.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }, 'Server is healthy');
};

/**
 * Detailed health check with database status
 */
export const getHealthDetailed = async (req, res, next) => {
  try {
    const startTime = Date.now();

    // Test database connection
    let dbStatus = 'healthy';
    let dbLatency = 0;

    try {
      const dbStart = Date.now();
      await testConnection();
      dbLatency = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'unhealthy';
      logger.error('Database health check failed:', error.message);
    }

    const healthData = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB'
      },
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`
      },
      responseTime: `${Date.now() - startTime}ms`
    };

    res.success(healthData, 'Health check completed');
  } catch (error) {
    next(error);
  }
};

export default { getHealth, getHealthDetailed };
