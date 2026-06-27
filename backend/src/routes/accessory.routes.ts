import { Router } from 'express';
import { getAccessories, getAccessoryById, createAccessory, updateAccessory, deleteAccessory } from '../controllers/accessory.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Public or Authenticated routes
router.get('/', getAccessories);
router.get('/:id', getAccessoryById);

// Admin / Staff only routes
router.post('/', protect, restrictTo('admin', 'staff'), createAccessory);
router.put('/:id', protect, restrictTo('admin', 'staff'), updateAccessory);
router.delete('/:id', protect, restrictTo('admin', 'staff'), deleteAccessory);

export default router;
