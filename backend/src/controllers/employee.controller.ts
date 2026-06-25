import { Request, Response } from 'express';
import { adminAuth } from '../config/firebase-admin';
import { z } from 'zod';
import { User } from '../models/user.model';
import { logActivity } from './logs.controller';

const employeeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(8),
  position: z.string().optional(),
  role: z.enum(['staff', 'admin']),
  password: z.string().min(6).optional()
});

const employeeUpdateSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(8).optional(),
  position: z.string().optional(),
  role: z.enum(['staff', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional()
});

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = employeeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid input.', errors: parsed.error.format() });
      return;
    }

    const { email, firstName, lastName, phone, position, role, password } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'A user with this email address already exists.' });
      return;
    }

    if (!adminAuth) {
      res.status(500).json({ message: 'Firebase Admin not configured' });
      return;
    }

    const firebaseUser = await adminAuth.createUser({
      email,
      password: password || 'defaultPassword123!',
      displayName: `${firstName} ${lastName}`,
    });

    const employee = await User.create({
      email,
      firebaseUid: firebaseUser.uid,
      firstName,
      lastName,
      phone,
      position,
      role
    });

    await logActivity('Created new employee', (req as any).user?.email || 'admin', req.ip || '', 'success');

    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create employee.', error: (error as Error).message });
  }
};

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = employeeUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid input.', errors: parsed.error.format() });
      return;
    }

    const employeeId = req.params.id;
    const employee = await User.findOne({ _id: employeeId, role: { $in: ['staff', 'admin'] } });
    
    if (!employee) {
      res.status(404).json({ message: 'Employee not found.' });
      return;
    }

    Object.assign(employee, parsed.data);
    await employee.save();

    await logActivity(`Updated employee profile (${employee.email})`, (req as any).user?.email || 'admin', req.ip || '', 'info');

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update employee.', error: (error as Error).message });
  }
};

export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = req.params.id;

    // Prevent deletion of the super admin (the first admin account created)
    const firstAdmin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
    if (firstAdmin && firstAdmin._id.toString() === employeeId) {
      res.status(403).json({ message: 'The super admin account cannot be deleted via the dashboard.' });
      return;
    }

    const employee = await User.findOneAndDelete({ _id: employeeId, role: { $in: ['staff', 'admin'] } });

    if (!employee) {
      res.status(404).json({ message: 'Employee not found.' });
      return;
    }

    if (adminAuth && employee.firebaseUid) {
      try {
        await adminAuth.deleteUser(employee.firebaseUid);
      } catch (err) {
        console.warn('Failed to delete user from Firebase Auth', err);
      }
    }

    await logActivity(`Deleted employee (${employee.email})`, (req as any).user?.email || 'admin', req.ip || '', 'warning');

    res.status(200).json({ message: 'Employee deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete employee.', error: (error as Error).message });
  }
};

export const resetEmployeePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const employeeId = req.params.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      return;
    }

    const employee = await User.findOne({ _id: employeeId, role: { $in: ['staff', 'admin'] } });
    if (!employee) {
      res.status(404).json({ message: 'Employee not found.' });
      return;
    }

    if (adminAuth && employee.firebaseUid) {
      await adminAuth.updateUser(employee.firebaseUid, {
        password: newPassword
      });
      // Immediately revoke all existing sessions to force logout
      await adminAuth.revokeRefreshTokens(employee.firebaseUid);
    } else {
      res.status(500).json({ message: 'Firebase Admin not configured or employee missing Firebase UID' });
      return;
    }

    await logActivity(`Reset password for employee (${employee.email})`, (req as any).user?.email || 'admin', req.ip || '', 'warning');

    res.status(200).json({ message: 'Employee password reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset employee password.', error: (error as Error).message });
  }
};
