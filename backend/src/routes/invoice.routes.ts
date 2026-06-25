import { Router } from 'express';
import { getInvoices, getPayments, getMyInvoices } from '../controllers/invoice.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.get('/my', protect as any, getMyInvoices as any);

router.use(protect as any, restrictTo('staff', 'admin') as any);
router.get('/', getInvoices as any);
router.get('/payments', getPayments as any);

export default router;
