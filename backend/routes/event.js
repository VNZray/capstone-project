import express from 'express';
import * as eventController from '../controller/eventController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorizeAny } from '../middleware/authorize.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// These routes are accessible without authentication

// Get all events (public - shows approved/published only)
router.get('/', eventController.getAllEvents);

// Search events with filters
router.get('/search', eventController.searchEvents);

// Get featured events
router.get('/featured', eventController.getFeaturedEvents);

// Get featured events by display location
router.get('/featured/:location', eventController.getFeaturedEventsByLocation);

// Get popular events
router.get('/popular', eventController.getPopularEvents);

// Get events for calendar view
router.get('/calendar', eventController.getEventsForCalendar);

// Get event density by month (for calendar indicators)
router.get('/calendar/density', eventController.getEventDensityByMonth);

// Get events by date range
router.get('/by-date', eventController.getEventsByDateRange);

// Get nearby events
router.get('/nearby', eventController.getNearbyEvents);

// Get all event categories
router.get('/categories', eventController.getAllEventCategories);

// Get event category by ID
router.get('/categories/:id', eventController.getEventCategoryById);

// Get events by category
router.get('/category/:categoryId', eventController.getEventsByCategory);

// Get all event tags
router.get('/tags', eventController.getAllEventTags);

// Get event by slug (for public URLs)
router.get('/slug/:slug', eventController.getEventBySlug);

// Get event by ID
router.get('/:id', eventController.getEventById);

// Get event images
router.get('/:id/images', eventController.getEventImages);

// Get event schedules
router.get('/:id/schedules', eventController.getEventSchedules);

// Get event tags
router.get('/:id/tags', eventController.getEventTags);

// Get event reviews (public - shows approved only)
router.get('/:id/reviews', eventController.getEventReviews);

// Get event average rating
router.get('/:id/rating', eventController.getEventAverageRating);

// Get event stats
router.get('/:id/stats', eventController.getEventStats);

// Check if event is bookmarked (works with or without auth)
router.get('/:id/bookmark/check', eventController.isEventBookmarked);

// ==================== AUTHENTICATED ROUTES ====================
// These routes require user authentication

// Create new event
router.post('/', authenticate, eventController.createEvent);

// Update event
router.put('/:id', authenticate, eventController.updateEvent);

// Delete event
router.delete('/:id', authenticate, eventController.deleteEvent);

// Submit event for approval
router.post('/:id/submit', authenticate, eventController.submitEventForApproval);

// ==================== EVENT IMAGES (Authenticated) ====================

// Add image to event
router.post('/:id/images', authenticate, eventController.addEventImage);

// Update event image
router.put('/images/:imageId', authenticate, eventController.updateEventImage);

// Delete event image
router.delete('/images/:imageId', authenticate, eventController.deleteEventImage);

// Set primary image
router.put('/images/:imageId/primary', authenticate, eventController.setPrimaryEventImage);

// ==================== EVENT SCHEDULES (Authenticated) ====================

// Add schedule to event
router.post('/:id/schedules', authenticate, eventController.addEventSchedule);

// Update event schedule
router.put('/schedules/:scheduleId', authenticate, eventController.updateEventSchedule);

// Delete event schedule
router.delete('/schedules/:scheduleId', authenticate, eventController.deleteEventSchedule);

// ==================== EVENT TAGS (Authenticated) ====================

// Sync event tags
router.put('/:id/tags', authenticate, eventController.syncEventTags);

// ==================== REVIEWS (Authenticated) ====================

// Add review
router.post('/:id/reviews', authenticate, eventController.addEventReview);

// Update review
router.put('/reviews/:reviewId', authenticate, eventController.updateEventReview);

// Delete review
router.delete('/reviews/:reviewId', authenticate, eventController.deleteEventReview);

// ==================== BOOKMARKS (Authenticated) ====================

// Add bookmark
router.post('/:id/bookmark', authenticate, eventController.addEventBookmark);

// Remove bookmark
router.delete('/:id/bookmark', authenticate, eventController.removeEventBookmark);

// Get user's bookmarked events
router.get('/user/bookmarks', authenticate, eventController.getUserBookmarkedEvents);

// ==================== ADMIN ROUTES ====================
// These routes require admin or tourism officer permissions

// Get pending events for approval
router.get('/admin/pending', authenticate, authorizeAny('manage_events', 'approve_events'), eventController.getPendingEvents);

// Approve event
router.post('/:id/approve', authenticate, authorizeAny('manage_events', 'approve_events'), eventController.approveEvent);

// Reject event
router.post('/:id/reject', authenticate, authorizeAny('manage_events', 'approve_events'), eventController.rejectEvent);

// Set event as featured
router.put('/:id/featured', authenticate, authorizeAny('manage_events', 'manage_featured'), eventController.setEventFeatured);

// Feature an event (simple add to featured)
router.post('/:id/feature', authenticate, authorizeAny('manage_events', 'manage_featured'), eventController.featureEvent);

// Unfeature an event
router.delete('/:id/feature', authenticate, authorizeAny('manage_events', 'manage_featured'), eventController.unfeatureEvent);

// Update featured events order
router.put('/featured/order', authenticate, authorizeAny('manage_events', 'manage_featured'), eventController.updateFeaturedOrder);

// ==================== CATEGORY MANAGEMENT (Admin) ====================

// Create event category
router.post('/categories', authenticate, authorizeAny('manage_events', 'manage_categories'), eventController.createEventCategory);

// Update event category
router.put('/categories/:id', authenticate, authorizeAny('manage_events', 'manage_categories'), eventController.updateEventCategory);

// Delete event category
router.delete('/categories/:id', authenticate, authorizeAny('manage_events', 'manage_categories'), eventController.deleteEventCategory);

export default router;
