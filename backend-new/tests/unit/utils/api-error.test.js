/**
 * API Error Class Tests
 */

import ApiError from '../../../src/utils/api-error.js';

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create error with status code and message', () => {
      const error = new ApiError(400, 'Bad request');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.isOperational).toBe(true);
    });

    it('should include stack trace', () => {
      const error = new ApiError(500, 'Server error');

      expect(error.stack).toBeDefined();
    });
  });

  describe('factory methods', () => {
    it('should create badRequest error', () => {
      const error = ApiError.badRequest('Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('should create unauthorized error', () => {
      const error = ApiError.unauthorized('Not authenticated');

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Not authenticated');
    });

    it('should create forbidden error', () => {
      const error = ApiError.forbidden('Access denied');

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
    });

    it('should create notFound error', () => {
      const error = ApiError.notFound('Resource not found');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create conflict error', () => {
      const error = ApiError.conflict('Already exists');

      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Already exists');
    });

    it('should create tooManyRequests error', () => {
      const error = ApiError.tooManyRequests('Rate limit exceeded');

      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Rate limit exceeded');
    });

    it('should create internal error', () => {
      const error = ApiError.internal('Something went wrong');

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Something went wrong');
    });

    it('should use default message when none provided', () => {
      const error = ApiError.unauthorized();

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });
  });
});
