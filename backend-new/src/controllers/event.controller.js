/**
 * Event Controller
 * Handles event operations
 */
import { Event } from '../models/index.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

/**
 * Create an event
 */
export const createEvent = catchAsync(async (req, res) => {
  const eventData = {
    id: uuidv4(),
    ...req.body,
    created_by: req.user?.id
  };

  const event = await Event.create(eventData);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: event
  });
});

/**
 * Get event by ID
 */
export const getEvent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findByPk(id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  res.json({
    success: true,
    data: event
  });
});

/**
 * Get all events
 */
export const getAllEvents = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};

  if (status) {
    where.status = status;
  }

  if (startDate) {
    where.start_date = { [Op.gte]: new Date(startDate) };
  }

  if (endDate) {
    where.end_date = { [Op.lte]: new Date(endDate) };
  }

  const { count, rows: events } = await Event.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset,
    order: [['start_date', 'ASC']]
  });

  res.json({
    success: true,
    data: events,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    }
  });
});

/**
 * Get upcoming events
 */
export const getUpcomingEvents = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  const events = await Event.findAll({
    where: {
      start_date: { [Op.gte]: new Date() },
      status: 'active'
    },
    limit: parseInt(limit),
    order: [['start_date', 'ASC']]
  });

  res.json({
    success: true,
    data: events
  });
});

/**
 * Get events by date range
 */
export const getEventsByDateRange = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new AppError('Start date and end date are required', 400);
  }

  const events = await Event.findAll({
    where: {
      start_date: { [Op.lte]: new Date(endDate) },
      end_date: { [Op.gte]: new Date(startDate) },
      status: 'active'
    },
    order: [['start_date', 'ASC']]
  });

  res.json({
    success: true,
    data: events
  });
});

/**
 * Update event
 */
export const updateEvent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const event = await Event.findByPk(id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await event.update(updateData);

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: event
  });
});

/**
 * Delete event
 */
export const deleteEvent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findByPk(id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await event.destroy();

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
});

/**
 * Update event status
 */
export const updateEventStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const event = await Event.findByPk(id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  await event.update({ status });

  res.json({
    success: true,
    message: `Event status updated to ${status}`,
    data: event
  });
});

/**
 * Get featured events
 */
export const getFeaturedEvents = catchAsync(async (req, res) => {
  const { limit = 5 } = req.query;

  const events = await Event.findAll({
    where: {
      is_featured: true,
      status: 'active',
      start_date: { [Op.gte]: new Date() }
    },
    limit: parseInt(limit),
    order: [['start_date', 'ASC']]
  });

  res.json({
    success: true,
    data: events
  });
});

export default {
  createEvent,
  getEvent,
  getAllEvents,
  getUpcomingEvents,
  getEventsByDateRange,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getFeaturedEvents
};
