/**
 * Catch Async Utility
 * Wraps async route handlers to catch errors and pass to Express error middleware
 */

/**
 * Wrap an async function to catch errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
