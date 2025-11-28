/**
 * Integration Tests for Token Refresh Flow
 * Tests the complete refresh token lifecycle including rotation, reuse detection, expiry,
 * and algorithm enforcement (HS256 pinning)
 * 
 * NOTE: These tests mock the database layer. For full end-to-end tests,
 * run against a test database.
 * 
 * @module tests/integration/refreshToken.test
 */

import { jest, describe, test, expect, beforeEach, afterAll, beforeAll } from '@jest/globals';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Set environment variables before importing modules
process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_testing_only_32chars!';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing_only_32chars!';
process.env.ACCESS_TOKEN_EXPIRY = '15m';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_NAME = 'test_db';

// Create mock functions BEFORE mocking modules
const mockQuery = jest.fn();
const mockBcryptCompare = jest.fn();

// Use unstable_mockModule for ESM compatibility - must be BEFORE dynamic imports
jest.unstable_mockModule('../../db.js', () => ({
  default: {
    query: mockQuery,
    end: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    compare: mockBcryptCompare,
    hash: jest.fn().mockResolvedValue('$2b$10$mockedhash'),
  },
  compare: mockBcryptCompare,
  hash: jest.fn().mockResolvedValue('$2b$10$mockedhash'),
}));

// Dynamic imports AFTER mocking - this is required for ESM mocks to work
const { default: db } = await import('../../db.js');
const bcrypt = await import('bcrypt');
const authService = await import('../../services/authService.js');

describe('Token Refresh Flow Integration Tests', () => {
  const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  const testUser = {
    id: 'user-test-123',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    user_role_id: 2,
    role_name: 'Tourist',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
    mockBcryptCompare.mockReset();
  });

  afterAll(async () => {
    // Clean up any open handles
    jest.restoreAllMocks();
    if (db && typeof db.end === 'function') {
      await db.end();
    }
  });

  describe('generateTokens', () => {
    test('should generate valid access and refresh tokens', async () => {
      // Mock role lookup - generateTokens uses direct query, not SP
      mockQuery.mockResolvedValueOnce([[{ role_name: 'Tourist' }]]);

      const { accessToken, refreshToken } = await authService.generateTokens(testUser);

      // Verify access token
      const accessPayload = jwt.verify(accessToken, JWT_ACCESS_SECRET);
      expect(accessPayload.id).toBe(testUser.id);
      expect(accessPayload.email).toBe(testUser.email);
      expect(accessPayload.role).toBe('Tourist');

      // Verify refresh token
      const refreshPayload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      expect(refreshPayload.id).toBe(testUser.id);
      expect(refreshPayload.familyId).toBeDefined();
      expect(refreshPayload.version).toBe(0);
    });

    test('should include role name from database if not provided', async () => {
      const userWithoutRole = { ...testUser, role_name: undefined };
      mockQuery.mockResolvedValueOnce([[{ role_name: 'Admin' }]]);

      const { accessToken } = await authService.generateTokens(userWithoutRole);
      const payload = jwt.verify(accessToken, JWT_ACCESS_SECRET);

      expect(payload.role).toBe('Admin');
    });
  });

  describe('loginUser', () => {
    test('should return tokens and user on successful login', async () => {
      // Mock GetUserByEmail stored procedure
      mockQuery.mockResolvedValueOnce([[[testUser]]]);
      // Mock role lookup (direct query in loginUser)
      mockQuery.mockResolvedValueOnce([[{ role_name: 'Tourist' }]]);
      // Mock role lookup (in generateTokens - since role_name is already set, it may skip)
      // But to be safe, let's add another mock for generateTokens internal query
      mockQuery.mockResolvedValueOnce([[{ role_name: 'Tourist' }]]);
      // Mock InsertRefreshToken stored procedure
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Setup bcrypt mock to return true for password match
      mockBcryptCompare.mockResolvedValue(true);

      const result = await authService.loginUser(testUser.email, 'password123');

      expect(result.user.email).toBe(testUser.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      // Verify InsertRefreshToken was called
      expect(mockQuery).toHaveBeenCalledWith(
        'CALL InsertRefreshToken(?, ?, ?, ?)',
        expect.any(Array)
      );
    });

    test('should throw error for non-existent user', async () => {
      mockQuery.mockResolvedValueOnce([[[]]]); // Empty user array

      await expect(authService.loginUser('nonexistent@example.com', 'password'))
        .rejects.toThrow('Invalid email or password');
    });

    test('should throw error for invalid password', async () => {
      mockQuery.mockResolvedValueOnce([[[testUser]]]);
      mockQuery.mockResolvedValueOnce([[{ role_name: 'Tourist' }]]);
      mockBcryptCompare.mockResolvedValue(false);

      await expect(authService.loginUser(testUser.email, 'wrongpassword'))
        .rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshAccessToken', () => {
    test('should issue new token pair on valid refresh', async () => {
      // Create a valid refresh token
      const refreshPayload = {
        id: testUser.id,
        familyId: 'family-123',
        version: 0,
      };
      const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      // Mock GetRefreshToken - stored procedure returns [[[token]], metadata]
      // After destructuring: rows = [[token]], tokens = [token], dbToken = token
      mockQuery.mockResolvedValueOnce([[[{
        token_hash: tokenHash,
        user_id: testUser.id,
        family_id: 'family-123',
        revoked: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }]]]);
      
      // Mock UPDATE to revoke old token
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      // Mock GetUserById for fresh user data
      mockQuery.mockResolvedValueOnce([[[testUser]]]);
      
      // Mock role lookup
      mockQuery.mockResolvedValueOnce([[{ role_name: 'Tourist' }]]);
      
      // Mock InsertRefreshToken for new token
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await authService.refreshAccessToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      // Verify new tokens are different
      expect(result.refreshToken).not.toBe(refreshToken);

      // Verify new access token has user info
      const newAccessPayload = jwt.verify(result.accessToken, JWT_ACCESS_SECRET);
      expect(newAccessPayload.id).toBe(testUser.id);
    });

    test('should detect and reject reused refresh tokens', async () => {
      const refreshPayload = {
        id: testUser.id,
        familyId: 'family-456',
        version: 0,
      };
      const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      // Mock GetRefreshToken - token is REVOKED (reuse attempt!)
      // Stored procedure returns [[[token]], metadata]
      mockQuery.mockResolvedValueOnce([[[{
        token_hash: tokenHash,
        user_id: testUser.id,
        family_id: 'family-456',
        revoked: true, // Already used!
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }]]]);
      
      // Mock RevokeRefreshTokenFamily (should revoke entire family)
      mockQuery.mockResolvedValueOnce([{ affectedRows: 5 }]);

      await expect(authService.refreshAccessToken(refreshToken))
        .rejects.toThrow('Refresh token reuse detected - session invalidated');

      // Verify family was revoked
      expect(mockQuery).toHaveBeenCalledWith(
        'CALL RevokeRefreshTokenFamily(?)',
        ['family-456']
      );
    });

    test('should reject tokens not found in database', async () => {
      const refreshPayload = {
        id: testUser.id,
        familyId: 'family-789',
        version: 0,
      };
      const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: '7d', algorithm: 'HS256' });

      // Mock GetRefreshToken - returns empty (token not in DB)
      // Stored procedure returns [[[]], metadata] when not found
      mockQuery.mockResolvedValueOnce([[[]]]);

      await expect(authService.refreshAccessToken(refreshToken))
        .rejects.toThrow('Invalid refresh token (not found)');
    });

    test('should reject expired refresh tokens', async () => {
      const refreshPayload = {
        id: testUser.id,
        familyId: 'family-expired',
        version: 0,
      };
      // Create already expired token
      const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: '-1s', algorithm: 'HS256' });

      await expect(authService.refreshAccessToken(refreshToken))
        .rejects.toThrow('Invalid refresh token');
    });

    test('should reject tokens signed with wrong secret', async () => {
      const refreshPayload = {
        id: testUser.id,
        familyId: 'family-wrong-secret',
        version: 0,
      };
      const refreshToken = jwt.sign(refreshPayload, 'wrong_secret', { expiresIn: '7d', algorithm: 'HS256' });

      await expect(authService.refreshAccessToken(refreshToken))
        .rejects.toThrow('Invalid refresh token');
    });

    test('should increment version on rotation', async () => {
      const refreshPayload = {
        id: testUser.id,
        familyId: 'family-version-test',
        version: 5, // Starting version
      };
      const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      // Stored procedure returns [[[token]], metadata]
      mockQuery.mockResolvedValueOnce([[[{
        token_hash: tokenHash,
        user_id: testUser.id,
        family_id: 'family-version-test',
        revoked: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }]]]);
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
      mockQuery.mockResolvedValueOnce([[[testUser]]]);
      mockQuery.mockResolvedValueOnce([[{ role_name: 'Tourist' }]]);
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await authService.refreshAccessToken(refreshToken);

      // Decode new refresh token to check version
      const newPayload = jwt.decode(result.refreshToken);
      expect(newPayload.version).toBe(6); // Should be incremented
      expect(newPayload.familyId).toBe('family-version-test'); // Same family
    });
  });

  describe('logout', () => {
    test('should delete refresh token from database', async () => {
      const refreshPayload = {
        id: testUser.id,
        familyId: 'family-logout',
        version: 0,
      };
      const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: '7d', algorithm: 'HS256' });

      // Mock DeleteRefreshToken
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await authService.logout(refreshToken);

      expect(mockQuery).toHaveBeenCalledWith(
        'CALL DeleteRefreshToken(?)',
        expect.any(Array)
      );
    });

    test('should handle logout with no token gracefully', async () => {
      await expect(authService.logout(null)).resolves.not.toThrow();
      await expect(authService.logout(undefined)).resolves.not.toThrow();
    });
  });

  describe('revokeUserRefreshTokens', () => {
    test('should revoke all tokens for a user', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 3 }]);

      await authService.revokeUserRefreshTokens(testUser.id);

      expect(mockQuery).toHaveBeenCalledWith(
        'CALL RevokeUserRefreshTokens(?)',
        [testUser.id]
      );
    });
  });
});

describe('Token Refresh Concurrent Request Handling', () => {
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
  });

  test('should handle race condition on concurrent refresh attempts', async () => {
    // This tests the scenario where multiple tabs/requests try to refresh
    // with the same token simultaneously.
    
    const refreshPayload = {
      id: 'race-user',
      familyId: 'race-family',
      version: 0,
    };
    const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: '7d', algorithm: 'HS256' });
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const raceUser = { 
      id: 'race-user', 
      email: 'race@test.com', 
      user_role_id: 1,
      role_name: 'Admin'
    };

    // All mocks in single chain
    // First call: 4 queries (role_name already in user, so no role lookup)
    // Second call: 2 queries (GetRefreshToken finds revoked, then RevokeFamily)
    mockQuery
      // First call succeeds - stored procedure returns [[[token]], metadata]
      .mockResolvedValueOnce([[[{
        token_hash: tokenHash,
        user_id: 'race-user',
        family_id: 'race-family',
        revoked: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }]]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE revoke
      .mockResolvedValueOnce([[[raceUser]]]) // GetUserById - has role_name, skips role lookup
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // InsertRefreshToken
      // Second call finds token already revoked
      .mockResolvedValueOnce([[[{
        token_hash: tokenHash,
        user_id: 'race-user',
        family_id: 'race-family',
        revoked: true, // Already revoked by first call
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }]]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // RevokeRefreshTokenFamily

    // First refresh should succeed
    const firstResult = await authService.refreshAccessToken(refreshToken);
    expect(firstResult.accessToken).toBeDefined();

    // Second refresh with same token should be detected as reuse
    await expect(authService.refreshAccessToken(refreshToken))
      .rejects.toThrow('Refresh token reuse detected');
  });
});

describe('Token Algorithm Enforcement (Security)', () => {
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery.mockReset();
  });

  test('should reject refresh tokens signed with none algorithm', async () => {
    // Attempt algorithm confusion attack with 'none' algorithm
    const payload = {
      id: 'attacker-123',
      familyId: 'attack-family',
      version: 0,
    };
    
    // Manually construct a token with 'none' algorithm
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const noneToken = `${header}.${payloadB64}.`;

    await expect(authService.refreshAccessToken(noneToken))
      .rejects.toThrow('Invalid refresh token');
  });

  test('should reject refresh tokens with algorithm mismatch in header', async () => {
    // Create a token that claims to be RS256 but uses the secret
    const payload = {
      id: 'user-123',
      familyId: 'family-123',
      version: 0,
    };
    
    // Manually construct with RS256 header
    const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const fakeSignature = Buffer.from('fake-rs256-signature').toString('base64url');
    const rs256Token = `${header}.${payloadB64}.${fakeSignature}`;

    await expect(authService.refreshAccessToken(rs256Token))
      .rejects.toThrow('Invalid refresh token');
  });

  test('should accept valid refresh tokens signed with HS256', async () => {
    const refreshPayload = {
      id: 'valid-user',
      familyId: 'valid-family',
      version: 0,
    };
    const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { 
      expiresIn: '7d', 
      algorithm: 'HS256' 
    });
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const testUser = {
      id: 'valid-user',
      email: 'valid@test.com',
      user_role_id: 2,
      role_name: 'Tourist',
    };

    // Setup mocks for successful refresh
    mockQuery
      .mockResolvedValueOnce([[[{
        token_hash: tokenHash,
        user_id: 'valid-user',
        family_id: 'valid-family',
        revoked: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }]]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE revoke
      .mockResolvedValueOnce([[[testUser]]]) // GetUserById
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // InsertRefreshToken

    const result = await authService.refreshAccessToken(refreshToken);
    
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    
    // Verify the new access token is valid and uses HS256
    const decodedAccess = jwt.decode(result.accessToken, { complete: true });
    expect(decodedAccess.header.alg).toBe('HS256');
    
    // Verify the new refresh token uses HS256
    const decodedRefresh = jwt.decode(result.refreshToken, { complete: true });
    expect(decodedRefresh.header.alg).toBe('HS256');
  });
});
