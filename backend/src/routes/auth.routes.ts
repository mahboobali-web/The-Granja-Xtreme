import { Router } from 'express';
import { 
  syncUser,
  getMe, 
  updateProfile, 
  getCustomers, 
  getEmployees,
  addCustomer,
  getCustomerDetails
} from '../controllers/auth.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.post('/sync', syncUser as any);

router.get('/me', protect as any, getMe as any);
router.put('/profile', protect as any, updateProfile as any);

router.get('/customers', protect as any, restrictTo('staff', 'admin') as any, getCustomers as any);
router.post('/customers', protect as any, restrictTo('staff', 'admin') as any, addCustomer as any);
router.get('/customers/:id/details', protect as any, restrictTo('staff', 'admin') as any, getCustomerDetails as any);
router.get('/employees', protect as any, restrictTo('admin') as any, getEmployees as any);

export default router;
