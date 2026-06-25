import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  resetEmployeePassword
} from '../controllers/employee.controller';
import { getEmployees } from '../controllers/auth.controller';

const router = Router();

// All employee routes are restricted to admin
router.use(protect as any, restrictTo('admin') as any);

router.get('/', getEmployees as any);
router.post('/', createEmployee as any);
router.put('/:id', updateEmployee as any);
router.delete('/:id', deleteEmployee as any);
router.post('/:id/reset-password', resetEmployeePassword as any);

export default router;
