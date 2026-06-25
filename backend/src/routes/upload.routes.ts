import express from 'express';
import { uploadImage } from '../controllers/upload.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', protect, uploadImage);

export default router;
