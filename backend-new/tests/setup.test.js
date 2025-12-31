/**
 * Jest Test Setup
 * Configures test environment and utilities
 */

import { testConnection, closeConnection, syncDatabase } from '../src/config/database.js';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Setup before all tests
beforeAll(async () => {
  try {
    await testConnection();
    // Sync database in test environment (force: true to recreate tables)
    await syncDatabase({ force: true });
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await closeConnection();
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
});

// Global test utilities
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides
  }),

  createMockResponse: () => {
    const res = {
      statusCode: 200,
      data: null
    };
    res.status = jest.fn((code) => {
      res.statusCode = code;
      return res;
    });
    res.json = jest.fn((data) => {
      res.data = data;
      return res;
    });
    res.send = jest.fn((data) => {
      res.data = data;
      return res;
    });
    res.cookie = jest.fn(() => res);
    res.clearCookie = jest.fn(() => res);
    return res;
  },

  createMockNext: () => jest.fn()
};
