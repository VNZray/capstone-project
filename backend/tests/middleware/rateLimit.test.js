/**
 * Unit Tests for Rate Limiting Middleware
 * Tests rate limiting behavior, window expiry, and header generation
 * 
 * @module tests/middleware/rateLimit.test
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  createRateLimiter,
  loginRateLimiter,
  refreshRateLimiter,
} from '../../middleware/rateLimit.js';

describe('Rate Limiting Middleware', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' },
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRateLimiter', () => {
    test('should allow requests under the limit', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxAttempts: 5,
      });

      // Use unique IP for this test
      mockReq.ip = '10.0.0.1';

      // First 5 requests should pass
      for (let i = 0; i < 5; i++) {
        limiter(mockReq, mockRes, nextFunction);
      }

      expect(nextFunction).toHaveBeenCalledTimes(5);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test('should block requests over the limit', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxAttempts: 3,
        message: 'Rate limited',
      });

      // Use unique IP for this test
      mockReq.ip = '10.0.0.2';

      // First 3 requests pass
      for (let i = 0; i < 3; i++) {
        limiter(mockReq, mockRes, nextFunction);
      }

      expect(nextFunction).toHaveBeenCalledTimes(3);

      // 4th request should be blocked
      limiter(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Rate limited',
        })
      );
    });

    test('should set rate limit headers', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxAttempts: 10,
      });

      // Use unique IP for this test
      mockReq.ip = '10.0.0.3';

      limiter(mockReq, mockRes, nextFunction);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 9);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(Number)
      );
    });

    test('should track by IP + email when useEmail is true', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxAttempts: 2,
        useEmail: true,
      });

      // Same IP, different emails should have separate limits
      mockReq.ip = '10.0.0.4';
      mockReq.body = { email: 'user1@test.com' };

      limiter(mockReq, mockRes, nextFunction);
      limiter(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(2);

      // Switch to different email - should get fresh limit
      mockReq.body = { email: 'user2@test.com' };
      nextFunction.mockClear();

      limiter(mockReq, mockRes, nextFunction);
      limiter(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(2);
    });

    test('should normalize email to lowercase for tracking', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxAttempts: 2,
        useEmail: true,
      });

      mockReq.ip = '10.0.0.5';

      // Use uppercase email
      mockReq.body = { email: 'USER@TEST.COM' };
      limiter(mockReq, mockRes, nextFunction);
      limiter(mockReq, mockRes, nextFunction);

      // Now use lowercase - should be same bucket
      mockReq.body = { email: 'user@test.com' };
      limiter(mockReq, mockRes, nextFunction);

      // Should be blocked (3rd attempt, limit is 2)
      expect(mockRes.status).toHaveBeenCalledWith(429);
    });

    test('should include retryAfter in blocked response', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxAttempts: 1,
      });

      mockReq.ip = '10.0.0.6';

      // First request passes
      limiter(mockReq, mockRes, nextFunction);

      // Second request blocked
      limiter(mockReq, mockRes, nextFunction);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          retryAfter: expect.any(Number),
        })
      );

      // Verify retryAfter is reasonable (between 0 and windowMs in seconds)
      const response = mockRes.json.mock.calls[0][0];
      expect(response.retryAfter).toBeGreaterThan(0);
      expect(response.retryAfter).toBeLessThanOrEqual(60);
    });
  });

  describe('loginRateLimiter', () => {
    test('should have correct configuration for login attempts', () => {
      // Use unique IP for this test
      mockReq.ip = '10.0.0.10';
      mockReq.body = { email: 'login-test@example.com' };

      // Should allow 5 attempts
      for (let i = 0; i < 5; i++) {
        loginRateLimiter(mockReq, mockRes, nextFunction);
      }

      expect(nextFunction).toHaveBeenCalledTimes(5);

      // 6th should be blocked
      loginRateLimiter(mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('login'),
        })
      );
    });
  });

  describe('refreshRateLimiter', () => {
    test('should have higher limit than login', () => {
      mockReq.ip = '10.0.0.11';

      // Should allow more attempts than login (30 vs 5)
      for (let i = 0; i < 30; i++) {
        refreshRateLimiter(mockReq, mockRes, nextFunction);
      }

      expect(nextFunction).toHaveBeenCalledTimes(30);

      // 31st should be blocked
      refreshRateLimiter(mockReq, mockRes, nextFunction);
      
      expect(mockRes.status).toHaveBeenCalledWith(429);
    });
  });

  describe('IP Fallback', () => {
    test('should use connection.remoteAddress if ip is not available', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxAttempts: 2,
      });

      mockReq.ip = undefined;
      mockReq.connection = { remoteAddress: '192.168.1.1' };

      limiter(mockReq, mockRes, nextFunction);
      limiter(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(2);

      // 3rd should be blocked
      limiter(mockReq, mockRes, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(429);
    });

    test('should use "unknown" if no IP source available', () => {
      const limiter = createRateLimiter({
        windowMs: 60000,
        maxAttempts: 1,
      });

      mockReq.ip = undefined;
      mockReq.connection = {};

      limiter(mockReq, mockRes, nextFunction);
      expect(nextFunction).toHaveBeenCalledTimes(1);

      // All unknown IPs share the same bucket
      limiter(mockReq, mockRes, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(429);
    });
  });
});
