import { Router } from 'express';
import {
  getAllAtvs,
  getAtvById,
  createAtv,
  updateAtv,
  deleteAtv,
  checkAtvAvailability,
  addMaintenance,
  addDamage,
  getAtvBookedDates
} from '../controllers/atv.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getAllAtvs as any);
router.get('/:id', getAtvById as any);
router.get('/:id/availability', checkAtvAvailability as any);
router.get('/:id/booked-dates', getAtvBookedDates as any);


// Restricted admin/staff routes
router.post('/', protect as any, restrictTo('staff', 'admin') as any, createAtv as any);
router.put('/:id', protect as any, restrictTo('staff', 'admin') as any, updateAtv as any);
router.delete('/:id', protect as any, restrictTo('admin') as any, deleteAtv as any);
router.post('/:id/maintenance', protect as any, restrictTo('staff', 'admin') as any, addMaintenance as any);
router.post('/:id/damage', protect as any, restrictTo('staff', 'admin') as any, addDamage as any);

export default router;
