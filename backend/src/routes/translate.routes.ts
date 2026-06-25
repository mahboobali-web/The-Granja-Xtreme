import { Router } from 'express';
import { translateText } from '../controllers/translate.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Endpoint for admin to translate text
router.post('/', protect, translateText);

export default router;
