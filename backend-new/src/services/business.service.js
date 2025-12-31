/**
 * Business Service
 * Business logic layer for business operations
 */
import { Business, Owner, Room, Amenity, Barangay } from '../models/index.js';
import { sequelize } from '../models/index.js';
import logger from '../config/logger.js';

/**
 * Get business with computed statistics
 * @param {string} businessId - Business ID
 */
export const getBusinessWithStats = async (businessId) => {
  const business = await Business.findByPk(businessId, {
    include: [
      { model: Room, as: 'rooms' },
      { model: Amenity, as: 'amenities' }
    ]
  });

  if (!business) return null;

  // Calculate room stats
  const rooms = business.rooms || [];
  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => r.status === 'Available').length,
    occupiedRooms: rooms.filter(r => r.status === 'Occupied').length,
    priceRange: {
      min: rooms.length ? Math.min(...rooms.map(r => parseFloat(r.base_price))) : 0,
      max: rooms.length ? Math.max(...rooms.map(r => parseFloat(r.base_price))) : 0
    }
  };

  return { ...business.toJSON(), stats };
};

/**
 * Search businesses with advanced filters
 */
export const searchBusinesses = async (filters) => {
  const {
    search,
    status = 'Active',
    hasBooking,
    hasStore,
    minPrice,
    maxPrice,
    barangayId,
    amenities,
    page = 1,
    limit = 20
  } = filters;

  const whereClause = {};

  if (status) whereClause.status = status;
  if (hasBooking !== undefined) whereClause.has_booking = hasBooking;
  if (hasStore !== undefined) whereClause.has_store = hasStore;
  if (barangayId) whereClause.barangay_id = barangayId;

  if (search) {
    whereClause[sequelize.Sequelize.Op.or] = [
      { business_name: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
      { description: { [sequelize.Sequelize.Op.like]: `%${search}%` } }
    ];
  }

  if (minPrice !== undefined) {
    whereClause.min_price = { [sequelize.Sequelize.Op.gte]: minPrice };
  }

  if (maxPrice !== undefined) {
    whereClause.max_price = { [sequelize.Sequelize.Op.lte]: maxPrice };
  }

  const includeOptions = [
    { model: Owner, as: 'owner', attributes: ['id', 'first_name', 'last_name'] },
    { model: Address, as: 'barangay' }
  ];

  // Filter by amenities if specified
  if (amenities && amenities.length > 0) {
    includeOptions.push({
      model: Amenity,
      as: 'amenities',
      where: { id: { [sequelize.Sequelize.Op.in]: amenities } },
      through: { attributes: [] }
    });
  } else {
    includeOptions.push({
      model: Amenity,
      as: 'amenities',
      through: { attributes: [] },
      required: false
    });
  }

  const offset = (page - 1) * limit;

  const result = await Business.findAndCountAll({
    where: whereClause,
    include: includeOptions,
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
    distinct: true
  });

  return {
    businesses: result.rows,
    total: result.count,
    page: parseInt(page),
    totalPages: Math.ceil(result.count / limit)
  };
};

/**
 * Update business capabilities
 */
export const updateBusinessCapabilities = async (businessId, capabilities) => {
  const business = await Business.findByPk(businessId);

  if (!business) {
    throw new Error('Business not found');
  }

  const updateData = {};

  if (capabilities.hasBooking !== undefined) {
    updateData.has_booking = capabilities.hasBooking;
  }
  if (capabilities.hasStore !== undefined) {
    updateData.has_store = capabilities.hasStore;
  }
  if (capabilities.hasServices !== undefined) {
    updateData.has_services = capabilities.hasServices;
  }

  await business.update(updateData);

  logger.info(`Business ${businessId} capabilities updated`);

  return business;
};

export default {
  getBusinessWithStats,
  searchBusinesses,
  updateBusinessCapabilities
};
