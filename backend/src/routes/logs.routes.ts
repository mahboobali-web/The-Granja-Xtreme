import { Router } from 'express';
import { getLogs, logAuthAttempt, getAuthLogs } from '../controllers/logs.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.post('/auth', logAuthAttempt as any); // Public
router.get('/auth', protect as any, restrictTo('admin') as any, getAuthLogs as any);
router.get('/', protect as any, restrictTo('admin') as any, getLogs as any);

export default router;
