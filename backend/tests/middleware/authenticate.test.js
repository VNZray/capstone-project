/**
 * Unit Tests for Authentication Middleware
 * Tests JWT validation, token expiry handling, and error cases
 * 
 * @module tests/middleware/authenticate.test
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock environment before importing authenticate
process.env.JWT_ACCESS_SECRET = 'test_access_secret_for_testing_only_32chars!';

// Now import the middleware (it will use the test secret)
import { authenticate } from '../../middleware/authenticate.js';

describe('authenticate middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  const JWT_SECRET = process.env.JWT_ACCESS_SECRET;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Authorization Header Validation', () => {
    test('should return 401 if no authorization header is provided', () => {
      authenticate(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Authorization header required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 401 if authorization header does not start with Bearer', () => {
      mockReq.headers['authorization'] = 'Basic sometoken';

      authenticate(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid token format (Bearer required)',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 401 if authorization header is just "Bearer" without token', () => {
      mockReq.headers['authorization'] = 'Bearer ';

      authenticate(mockReq, mockRes, nextFunction);

      // Token would be empty string, jwt.verify will fail
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Token Validation', () => {
    test('should call next() and set req.user for valid token', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'Admin',
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      mockReq.headers['authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockReq.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        user_role_id: 'Admin',
        role: 'Admin',
      });
    });

    test('should return 401 for expired token', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'Admin',
      };
      // Create an already-expired token
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });
      mockReq.headers['authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token expired',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 403 for token signed with wrong secret', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'Admin',
      };
      const token = jwt.sign(payload, 'wrong_secret', { expiresIn: '15m' });
      mockReq.headers['authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 403 for malformed token', () => {
      mockReq.headers['authorization'] = 'Bearer not.a.valid.jwt.token';

      authenticate(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 403 for tampered token payload', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'Admin',
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      
      // Tamper with the payload portion of the token
      const parts = token.split('.');
      const tamperedPayload = Buffer.from(JSON.stringify({
        id: 'hacker-999',
        email: 'hacker@evil.com',
        role: 'Admin',
      })).toString('base64url');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
      
      mockReq.headers['authorization'] = `Bearer ${tamperedToken}`;

      authenticate(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('User Object Population', () => {
    test('should correctly map role from token to user_role_id and role', () => {
      const payload = {
        id: 'user-456',
        email: 'manager@example.com',
        role: 'Business Owner',
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      mockReq.headers['authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, nextFunction);

      expect(mockReq.user).toEqual({
        id: 'user-456',
        email: 'manager@example.com',
        user_role_id: 'Business Owner',
        role: 'Business Owner',
      });
    });

    test('should handle tokens with additional claims', () => {
      const payload = {
        id: 'user-789',
        email: 'user@example.com',
        role: 'Tourist',
        iat: Math.floor(Date.now() / 1000),
        customClaim: 'some value',
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      mockReq.headers['authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, nextFunction);

      expect(mockReq.user.id).toBe('user-789');
      expect(mockReq.user.email).toBe('user@example.com');
      expect(mockReq.user.role).toBe('Tourist');
    });
  });

  describe('Edge Cases', () => {
    test('should handle token with minimal payload', () => {
      // Token with just id (edge case - email and role might be missing)
      const payload = { id: 'user-minimal' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      mockReq.headers['authorization'] = `Bearer ${token}`;

      authenticate(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockReq.user.id).toBe('user-minimal');
      expect(mockReq.user.email).toBeUndefined();
      expect(mockReq.user.role).toBeUndefined();
    });

    test('should handle lowercase bearer prefix', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'Admin',
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      mockReq.headers['authorization'] = `bearer ${token}`;

      authenticate(mockReq, mockRes, nextFunction);

      // Should fail because Bearer is case-sensitive
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid token format (Bearer required)',
      });
    });

    test('should handle authorization header with extra spaces', () => {
      const payload = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'Admin',
      };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      mockReq.headers['authorization'] = `Bearer  ${token}`; // Two spaces

      authenticate(mockReq, mockRes, nextFunction);

      // Token will have leading space, causing validation failure
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});
