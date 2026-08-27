import { Router } from 'express';
import { getOrders } from '../controllers/order.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', restrictTo('admin', 'staff'), getOrders);

export default router;
