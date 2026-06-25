import { Router } from 'express';
import { submitReview, getPublicReviews, getAdminReviews, updateReviewStatus } from '../controllers/review.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.get('/public', getPublicReviews as any);
router.post('/', protect as any, submitReview as any);

router.get('/admin', protect as any, restrictTo('admin', 'staff') as any, getAdminReviews as any);
router.put('/:id/status', protect as any, restrictTo('admin', 'staff') as any, updateReviewStatus as any);

export default router;
