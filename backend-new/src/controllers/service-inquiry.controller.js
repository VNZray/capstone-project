/**
 * Service Inquiry Controller
 * Handles service inquiry management for service-based businesses
 */
import { ServiceInquiry, Service, Business, User, sequelize } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { calculateOffset, formatPagination } from '../utils/helpers.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';

/**
 * Get all service inquiries (admin)
 */
export const getAllServiceInquiries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    const offset = calculateOffset(page, limit);

    const { count, rows: inquiries } = await ServiceInquiry.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    const pagination = formatPagination(count, parseInt(page), parseInt(limit));
    res.paginated(inquiries, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get service inquiries by business
 */
export const getServiceInquiriesByBusiness = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { status } = req.query;

    const whereClause = { business_id: businessId };

    if (status) {
      whereClause.status = status;
    }

    const inquiries = await ServiceInquiry.findAll({
      where: whereClause,
      include: [{
        model: Service,
        as: 'service',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']]
    });

    res.success(inquiries);
  } catch (error) {
    next(error);
  }
};

/**
 * Get service inquiries by service
 */
export const getServiceInquiriesByService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;

    const inquiries = await ServiceInquiry.findAll({
      where: { service_id: serviceId },
      order: [['created_at', 'DESC']]
    });

    res.success(inquiries);
  } catch (error) {
    next(error);
  }
};

/**
 * Get service inquiries by user
 */
export const getServiceInquiriesByUser = async (req, res, next) => {
  try {
    const { userId, guestId } = req.query;

    const whereClause = {};

    if (userId) {
      whereClause.user_id = userId;
    }

    if (guestId) {
      whereClause.guest_id = guestId;
    }

    if (!userId && !guestId) {
      throw ApiError.badRequest('userId or guestId is required');
    }

    const inquiries = await ServiceInquiry.findAll({
      where: whereClause,
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['id', 'name']
        },
        {
          model: Business,
          as: 'business',
          attributes: ['id', 'business_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.success(inquiries);
  } catch (error) {
    next(error);
  }
};

/**
 * Get service inquiry by ID
 */
export const getServiceInquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inquiry = await ServiceInquiry.findByPk(id, {
      include: [
        {
          model: Service,
          as: 'service'
        },
        {
          model: Business,
          as: 'business'
        }
      ]
    });

    if (!inquiry) {
      throw ApiError.notFound('Service inquiry not found');
    }

    res.success(inquiry);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new service inquiry
 */
export const createServiceInquiry = async (req, res, next) => {
  try {
    const {
      service_id,
      business_id,
      user_id,
      guest_id,
      message,
      number_of_people = 1,
      preferred_date,
      contact_method
    } = req.body;

    // Validate: must have either user_id or guest_id
    if (!user_id && !guest_id) {
      throw ApiError.badRequest('Either user_id or guest_id is required');
    }

    // Generate inquiry number
    const inquiry_number = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const inquiry = await ServiceInquiry.create({
      id: uuidv4(),
      service_id,
      business_id,
      user_id: user_id || null,
      guest_id: guest_id || null,
      inquiry_number,
      message,
      number_of_people,
      preferred_date,
      contact_method,
      status: 'new'
    });

    res.created({
      message: 'Service inquiry created successfully',
      inquiry_number,
      inquiry_id: inquiry.id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update service inquiry status
 */
export const updateServiceInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'contacted', 'converted', 'archived'];

    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const inquiry = await ServiceInquiry.findByPk(id);

    if (!inquiry) {
      throw ApiError.notFound('Service inquiry not found');
    }

    await inquiry.update({ status });

    res.success(inquiry, 'Inquiry status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark inquiry as viewed
 */
export const markServiceInquiryViewed = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inquiry = await ServiceInquiry.findByPk(id);

    if (!inquiry) {
      throw ApiError.notFound('Service inquiry not found');
    }

    await inquiry.update({ viewed_at: new Date() });

    res.success(inquiry, 'Inquiry marked as viewed');
  } catch (error) {
    next(error);
  }
};

/**
 * Add merchant response to inquiry
 */
export const respondToServiceInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      throw ApiError.badRequest('Response message is required');
    }

    const inquiry = await ServiceInquiry.findByPk(id);

    if (!inquiry) {
      throw ApiError.notFound('Service inquiry not found');
    }

    await inquiry.update({
      merchant_response: response,
      responded_at: new Date(),
      status: 'contacted'
    });

    res.success(inquiry, 'Response added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete service inquiry
 */
export const deleteServiceInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inquiry = await ServiceInquiry.findByPk(id);

    if (!inquiry) {
      throw ApiError.notFound('Service inquiry not found');
    }

    await inquiry.destroy();

    res.success(null, 'Service inquiry deleted successfully');
  } catch (error) {
    next(error);
  }
};
