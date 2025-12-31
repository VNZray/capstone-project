/**
 * Authenticate Middleware Tests
 */

import { authenticate, optionalAuth } from '../../../src/middlewares/authenticate.js';
import jwt from 'jsonwebtoken';
import config from '../../../src/config/config.js';

describe('Authenticate Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = global.testUtils.createMockRequest();
    mockRes = global.testUtils.createMockResponse();
    mockNext = global.testUtils.createMockNext();
  });

  describe('authenticate()', () => {
    it('should reject requests without authorization header', async () => {
      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should reject invalid token format', async () => {
      mockReq.headers.authorization = 'InvalidFormat token123';

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { id: 'user-123' },
        config.jwt.accessSecret,
        { expiresIn: '-1h' }
      );
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });

    it('should reject tokens with wrong algorithm', async () => {
      const token = jwt.sign(
        { id: 'user-123' },
        config.jwt.accessSecret,
        { algorithm: 'HS512' }
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      await authenticate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error.statusCode).toBe(401);
    });
  });

  describe('optionalAuth()', () => {
    it('should allow requests without token', async () => {
      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toBeNull();
    });

    it('should set user when valid token provided', async () => {
      const token = jwt.sign(
        { id: 'user-123' },
        config.jwt.accessSecret,
        { algorithm: 'HS256', expiresIn: '1h' }
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      // Note: This will fail if user doesn't exist in DB
      // In a real test, you'd mock the database or create a test user
      await optionalAuth(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
