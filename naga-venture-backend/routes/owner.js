import express from 'express';
import * as OwnerController from '../controller/OwnerController.js'; // Add `.js` extension

const router = express.Router();

router.post('/', OwnerController.insertOwner);
router.get('/:id', OwnerController.getOwnerById);

export default router;