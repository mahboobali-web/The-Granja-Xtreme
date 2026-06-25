import { Router } from 'express';
import { getTranslation } from '../controllers/translation.controller';

const router = Router();
router.post('/', getTranslation);

export default router;
