/**
 * Service Controller
 * Handles service operations
 */
import { sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { extractProcedureResult, extractSingleResult } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Create a new service
 */
export const createService = async (req, res, next) => {
  try {
    const {
      business_id,
      category_id,
      name,
      description,
      price,
      duration_minutes,
      is_available = true
    } = req.body;

    const id = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertService(?, ?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [id, business_id, category_id, name, description, price, duration_minutes, is_available]
      }
    );

    const queryResult = await sequelize.query('CALL GetServiceById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Service created successfully');
  } catch (error) {
    logger.error('Error creating service:', error);
    next(error);
  }
};

/**
 * Get service by ID
 */
export const getService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const queryResult = await sequelize.query('CALL GetServiceById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    if (!result) {
      throw ApiError.notFound('Service not found');
    }

    res.success(result);
  } catch (error) {
    logger.error('Error fetching service:', error);
    next(error);
  }
};

/**
 * Get services by business
 */
export const getBusinessServices = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, categoryId, status, search } = req.query;

    let results;
    if (status === 'available') {
      const queryResult = await sequelize.query('CALL GetAvailableServicesByBusinessId(?)', {
        replacements: [businessId]
      });
      results = extractProcedureResult(queryResult);
    } else {
      const queryResult = await sequelize.query('CALL GetServicesByBusinessId(?)', {
        replacements: [businessId]
      });
      results = extractProcedureResult(queryResult);
    }

    // Apply filters
    let filtered = results;
    if (categoryId) {
      filtered = filtered.filter(s => s.category_id === categoryId);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = filtered.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    });
  } catch (error) {
    logger.error('Error fetching business services:', error);
    next(error);
  }
};

/**
 * Update service
 */
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      price,
      duration_minutes,
      is_available
    } = req.body;

    await sequelize.query(
      'CALL UpdateService(?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [id, category_id, name, description, price, duration_minutes, is_available]
      }
    );

    const queryResult = await sequelize.query('CALL GetServiceById(?)', {
      replacements: [id]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Service updated successfully');
  } catch (error) {
    logger.error('Error updating service:', error);
    next(error);
  }
};

/**
 * Delete service
 */
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sequelize.query('CALL DeleteService(?)', {
      replacements: [id]
    });

    res.success(null, 'Service deactivated successfully');
  } catch (error) {
    logger.error('Error deleting service:', error);
    next(error);
  }
};

/**
 * Create service inquiry
 */
export const createInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, preferred_date, preferred_time } = req.body;
    const userId = req.user.id;

    // Get service to find business_id
    const serviceQuery = await sequelize.query('CALL GetServiceById(?)', {
      replacements: [id]
    });
    const service = extractSingleResult(serviceQuery);

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    const inquiryId = crypto.randomUUID();
    await sequelize.query(
      'CALL InsertServiceInquiry(?, ?, ?, ?, ?, ?, ?)',
      {
        replacements: [inquiryId, id, service.business_id, userId, message, preferred_date, preferred_time]
      }
    );

    const queryResult = await sequelize.query('CALL GetServiceInquiryById(?)', {
      replacements: [inquiryId]
    });
    const result = extractSingleResult(queryResult);

    res.status(201).success(result, 'Inquiry submitted successfully');
  } catch (error) {
    logger.error('Error creating inquiry:', error);
    next(error);
  }
};

/**
 * Get inquiries for a service
 */
export const getServiceInquiries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Get service to find business_id
    const serviceQuery = await sequelize.query('CALL GetServiceById(?)', {
      replacements: [id]
    });
    const service = extractSingleResult(serviceQuery);

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    const inquiriesQuery = await sequelize.query('CALL GetServiceInquiriesByBusinessId(?)', {
      replacements: [service.business_id]
    });
    const results = extractProcedureResult(inquiriesQuery);

    // Filter by service_id
    let filtered = results.filter(inq => inq.service_id === id);
    if (status) {
      filtered = filtered.filter(inq => inq.status === status);
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = filtered.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    });
  } catch (error) {
    logger.error('Error fetching service inquiries:', error);
    next(error);
  }
};

/**
 * Get all inquiries for a business
 */
export const getBusinessInquiries = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const queryResult = await sequelize.query('CALL GetServiceInquiriesByBusinessId(?)', {
      replacements: [businessId]
    });
    const results = extractProcedureResult(queryResult);

    let filtered = results;
    if (status) {
      filtered = filtered.filter(inq => inq.status === status);
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = filtered.slice(offset, offset + parseInt(limit));

    res.success({
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    });
  } catch (error) {
    logger.error('Error fetching business inquiries:', error);
    next(error);
  }
};

/**
 * Update inquiry status
 */
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const { status } = req.body;
    const respondedBy = req.user.id;

    await sequelize.query('CALL UpdateServiceInquiryStatus(?, ?, ?)', {
      replacements: [inquiryId, status, respondedBy]
    });

    const queryResult = await sequelize.query('CALL GetServiceInquiryById(?)', {
      replacements: [inquiryId]
    });
    const result = extractSingleResult(queryResult);

    res.success(result, 'Inquiry status updated');
  } catch (error) {
    logger.error('Error updating inquiry status:', error);
    next(error);
  }
};

export default {
  createService,
  getService,
  getBusinessServices,
  updateService,
  deleteService,
  createInquiry,
  getServiceInquiries,
  getBusinessInquiries,
  updateInquiryStatus
};
