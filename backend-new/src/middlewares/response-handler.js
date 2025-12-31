/**
 * Response Handler Middleware
 * Standardized API response format
 */

/**
 * Extend Express response with success helper methods
 */
export const responseHandler = (req, res, next) => {
  /**
   * Send success response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  res.success = (data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  };

  /**
   * Send created response (201)
   * @param {any} data - Created resource data
   * @param {string} message - Success message
   */
  res.created = (data, message = 'Resource created successfully') => {
    return res.status(201).json({
      success: true,
      message,
      data
    });
  };

  /**
   * Send no content response (204)
   */
  res.noContent = () => {
    return res.status(204).send();
  };

  /**
   * Send paginated response
   * @param {Array} data - Array of items
   * @param {Object} pagination - Pagination metadata
   */
  res.paginated = (data, pagination) => {
    return res.status(200).json({
      success: true,
      message: 'Success',
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalItems: pagination.totalItems,
        totalPages: Math.ceil(pagination.totalItems / pagination.limit),
        hasNextPage: pagination.page < Math.ceil(pagination.totalItems / pagination.limit),
        hasPrevPage: pagination.page > 1
      }
    });
  };

  /**
   * Send error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 400)
   * @param {Array} errors - Validation errors array
   */
  res.error = (message, statusCode = 400, errors = []) => {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors.length > 0 && { errors })
    });
  };

  next();
};

export default responseHandler;
