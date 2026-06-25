import { Router } from 'express';
import { scheduleMaintenance } from '../controllers/maintenance.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect as any, restrictTo('staff', 'admin') as any);
router.post('/schedule', scheduleMaintenance as any);

export default router;
