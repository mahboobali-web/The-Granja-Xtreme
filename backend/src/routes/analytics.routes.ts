import express from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import {
  getDashboardMetrics,
  getRevenueAnalytics,
  getBookingAnalytics,
  getFleetAnalytics,
  getCustomerAnalytics
} from '../controllers/analytics.controller';

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin', 'staff'));

router.get('/dashboard', getDashboardMetrics);
router.get('/revenue', getRevenueAnalytics);
router.get('/bookings', getBookingAnalytics);
router.get('/fleet', getFleetAnalytics);
router.get('/customers', getCustomerAnalytics);

export default router;
