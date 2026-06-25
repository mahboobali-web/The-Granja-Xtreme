import { Router } from 'express';
import { getSettings, updateSettings, exportDatabase } from '../controllers/settings.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.get('/export-db', protect as any, restrictTo('admin') as any, exportDatabase as any);
router.get('/', getSettings as any);
router.put('/', protect as any, restrictTo('admin') as any, updateSettings as any);

export default router;
