/**
 * Jest Test Setup
 * Set up environment variables and global mocks for testing
 */

// Set test environment variables BEFORE any module imports
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_testing_only_32chars!';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing_only_32chars!';
process.env.ACCESS_TOKEN_EXPIRY = '15m';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test_password'; // Required to prevent connection errors
process.env.DB_NAME = 'test_db';

// Note: jest.setTimeout is configured in jest.config.json via testTimeout
