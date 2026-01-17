import express from "express";
import * as guestController from "../controller/accommodation/guestController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/guest
 * @desc    Get all guests
 * @access  Private (staff/business owners)
 */
router.get("/", guestController.getAllGuests);

/**
 * @route   GET /api/guest/search
 * @desc    Search guests by name, phone, or email
 * @access  Private (staff/business owners)
 */
router.get("/search", guestController.searchGuests);

/**
 * @route   GET /api/guest/:id
 * @desc    Get guest by ID
 * @access  Private (staff/business owners)
 */
router.get("/:id", guestController.getGuestById);

/**
 * @route   GET /api/guest/phone/:phone
 * @desc    Get guest by phone number
 * @access  Private (staff/business owners)
 */
router.get("/phone/:phone", guestController.getGuestByPhone);

/**
 * @route   GET /api/guest/email/:email
 * @desc    Get guest by email
 * @access  Private (staff/business owners)
 */
router.get("/email/:email", guestController.getGuestByEmail);

/**
 * @route   POST /api/guest
 * @desc    Create new guest
 * @access  Private (staff/business owners)
 */
router.post("/", guestController.createGuest);

/**
 * @route   POST /api/guest/find-or-create
 * @desc    Find existing guest or create new one
 * @access  Private (staff/business owners)
 */
router.post("/find-or-create", guestController.findOrCreateGuest);

/**
 * @route   PUT /api/guest/:id
 * @desc    Update guest
 * @access  Private (staff/business owners)
 */
router.put("/:id", guestController.updateGuest);

/**
 * @route   DELETE /api/guest/:id
 * @desc    Delete guest
 * @access  Private (staff/business owners)
 */
router.delete("/:id", guestController.deleteGuest);

export default router;
