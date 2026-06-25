import { Router } from 'express';
import { submitContact, getMessages, markAsRead, deleteMessage } from '../controllers/contact.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.post('/', submitContact as any);
router.get('/', protect as any, restrictTo('admin', 'staff') as any, getMessages as any);
router.put('/:id/read', protect as any, restrictTo('admin', 'staff') as any, markAsRead as any);
router.delete('/:id', protect as any, restrictTo('admin', 'staff') as any, deleteMessage as any);

export default router;
