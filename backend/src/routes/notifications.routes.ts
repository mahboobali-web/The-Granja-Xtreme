import { Router } from 'express';
import { getUnreadNotifications, markAsRead, createNotification } from '../controllers/notifications.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect as any, restrictTo('staff', 'admin') as any);

router.get('/unread', getUnreadNotifications as any);
router.put('/:id/read', markAsRead as any);
router.post('/', createNotification as any); // Just for testing

export default router;
