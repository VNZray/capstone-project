import express from 'express';
import * as eventController from '../controller/event/eventController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// ===== PUBLIC ROUTES =====

// Get published events (for tourists/public)
router.get('/public', eventController.getPublishedEvents);

// Get upcoming events
router.get('/upcoming', eventController.getUpcomingEvents);

// ===== EVENT CATEGORIES =====

// Get all event categories
router.get('/categories', eventController.getAllEventCategories);

// Get category by ID
router.get('/categories/:id', eventController.getEventCategoryById);

// Create category (admin only)
router.post('/categories', authenticate, eventController.createEventCategory);

// Update category (admin only)
router.put('/categories/:id', authenticate, eventController.updateEventCategory);

// Delete category (admin only)
router.delete('/categories/:id', authenticate, eventController.deleteEventCategory);

// ===== FEATURED EVENTS =====

// Get featured events
router.get('/featured/list', eventController.getFeaturedEvents);

// Get non-featured events
router.get('/featured/non-featured', eventController.getNonFeaturedEvents);

// Feature an event
router.put('/featured/:id', authenticate, eventController.featureEvent);

// Unfeature an event
router.delete('/featured/:id', authenticate, eventController.unfeatureEvent);

// Update featured order
router.put('/featured/order', authenticate, eventController.updateFeaturedOrder);

// ===== EVENTS CRUD =====

// Get all events (admin/staff view)
router.get('/', eventController.getAllEvents);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Create new event
router.post('/', authenticate, eventController.createEvent);

// Update event
router.put('/:id', authenticate, eventController.updateEvent);

// Delete event
router.delete('/:id', authenticate, eventController.deleteEvent);

// Update event status
router.patch('/:id/status', authenticate, eventController.updateEventStatus);

// ===== EVENT IMAGES =====

// Get event images
router.get('/:event_id/images', eventController.getEventImages);

// Add event image
router.post('/:event_id/images', authenticate, eventController.addEventImage);

// Delete event image
router.delete('/:event_id/images/:image_id', authenticate, eventController.deleteEventImage);

// Set primary image
router.put('/:event_id/images/:image_id/set-primary', authenticate, eventController.setPrimaryEventImage);

// ===== EVENT CATEGORY MAPPINGS (Multiple Categories) =====

// Get categories for an event
router.get('/:event_id/categories', eventController.getEventCategories);

// Set categories for an event (replaces all existing)
router.put('/:event_id/categories', authenticate, eventController.setEventCategories);

// Add a category to an event
router.post('/:event_id/categories', authenticate, eventController.addEventCategoryMapping);

// Remove a category from an event
router.delete('/:event_id/categories/:category_id', authenticate, eventController.removeEventCategoryMapping);

// ===== EVENT LOCATIONS (Multiple Locations) =====

// Get locations for an event
router.get('/:event_id/locations', eventController.getEventLocations);

// Add a location to an event
router.post('/:event_id/locations', authenticate, eventController.addEventLocation);

// Update an event location
router.put('/:event_id/locations/:location_id', authenticate, eventController.updateEventLocation);

// Delete an event location
router.delete('/:event_id/locations/:location_id', authenticate, eventController.deleteEventLocation);

// Set primary location
router.put('/:event_id/locations/:location_id/set-primary', authenticate, eventController.setPrimaryEventLocation);

export default router;
