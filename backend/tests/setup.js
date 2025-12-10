/**
 * Jest Test Setup
 * Set up environment variables and global mocks for testing
 */

// Load environment variables from .env file FIRST
// This allows tests to use the same database as development
import dotenv from "dotenv";
dotenv.config();

// Set test-specific environment variables (non-DB)
process.env.NODE_ENV = "test";
process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  "test_access_secret_for_testing_only_32chars!";
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "test_refresh_secret_for_testing_only_32chars!";
process.env.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";

// Note: DB credentials are now loaded from .env file
// If you need a separate test database, create a .env.test file
// and update this setup to load it conditionally

// Note: jest.setTimeout is configured in jest.config.json via testTimeout
