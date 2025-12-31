/**
 * AppError Class
 * Custom error class for standardized application error handling
 * Compatible with the pattern: new AppError('message', statusCode)
 */
export class AppError extends Error {
  /**
   * Create an AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // Common error factory methods
  static badRequest(message = 'Bad Request') {
    return new AppError(message, 400);
  }

  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message = 'Resource already exists') {
    return new AppError(message, 409);
  }

  static unprocessable(message = 'Unprocessable Entity') {
    return new AppError(message, 422);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new AppError(message, 429);
  }

  static internal(message = 'Internal Server Error') {
    return new AppError(message, 500);
  }
}

export default AppError;
