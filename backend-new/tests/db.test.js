/**
 * Database Connection Tests
 */

import { testConnection, closeConnection, getSequelize } from '../src/config/database.js';

describe('Database Connection', () => {
  afterAll(async () => {
    await closeConnection();
  });

  it('should connect to the database successfully', async () => {
    await expect(testConnection()).resolves.not.toThrow();
  });

  it('should return a valid Sequelize instance', () => {
    const sequelize = getSequelize();
    expect(sequelize).toBeDefined();
    expect(sequelize.constructor.name).toBe('Sequelize');
  });

  it('should be able to run a simple query', async () => {
    const sequelize = getSequelize();
    const [results] = await sequelize.query('SELECT 1 + 1 AS result');
    expect(results[0].result).toBe(2);
  });
});
