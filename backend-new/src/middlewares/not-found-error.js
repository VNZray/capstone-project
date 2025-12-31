/**
 * 404 Not Found Handler
 * Handles requests to undefined routes
 */
import { ApiError } from '../utils/api-error.js';

export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};

export default notFoundHandler;
