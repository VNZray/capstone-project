/**
 * Reply Routes
 * Review reply management endpoints
 */
import { Router } from 'express';
import * as replyController from '../../controllers/reply.controller.js';
import { asyncHandler } from '../../middlewares/error-handler.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = Router();

// Public routes
router.get('/review/:reviewId', asyncHandler(replyController.getRepliesByReviewId));
router.get('/:id', asyncHandler(replyController.getReplyById));

// Protected routes
router.post(
  '/',
  authenticate,
  asyncHandler(replyController.createReply)
);

router.put(
  '/:id',
  authenticate,
  asyncHandler(replyController.updateReply)
);

router.delete(
  '/:id',
  authenticate,
  asyncHandler(replyController.deleteReply)
);

router.get(
  '/user/:userId',
  authenticate,
  asyncHandler(replyController.getRepliesByUserId)
);

export default router;
