import { Router } from 'express';
import { getCmsContent, updateCmsContent } from '../controllers/cms.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.get('/:key', getCmsContent as any);
router.put('/:key', protect as any, restrictTo('admin') as any, updateCmsContent as any);

export default router;
