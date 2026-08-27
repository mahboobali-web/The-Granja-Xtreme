import { Router } from 'express';
import { checkoutPOS } from '../controllers/pos.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Only admin and staff can perform POS transactions
router.post('/checkout', protect, restrictTo('admin', 'staff'), checkoutPOS);

export default router;
