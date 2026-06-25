import { Request, Response } from 'express';
import { adminAuth } from '../config/firebase-admin';
import { z } from 'zod';
import { User } from '../models/user.model';
import { Booking } from '../models/booking.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logActivity } from './logs.controller';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional()
});

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    if (!adminAuth) {
      res.status(500).json({ message: 'Firebase Admin not configured' });
      return;
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const { email, uid, name } = decoded;

    const orQuery: any[] = [{ firebaseUid: uid }];
    if (email) {
      orQuery.push({ email });
    }

    let user = await User.findOne({
      $or: orQuery
    });

    if (!user) {
      // Create new user if they don't exist
      let { firstName, lastName, phone } = req.body;
      
      if (!firstName && name) {
        const parts = name.split(' ');
        firstName = parts[0];
        lastName = parts.slice(1).join(' ') || 'Unknown';
      }

      const isFirstUser = (await User.countDocuments({})) === 0;
      const role = isFirstUser ? 'admin' : 'customer';

      user = await User.create({
        email: email || `${uid}@noemail.com`,
        firebaseUid: uid,
        firstName: firstName || 'User',
        lastName: lastName || 'Unknown',
        phone: phone || '0000000000',
        role
      });
      await logActivity(`New user registered via Firebase (${role})`, email || uid, req.ip || '', 'success');
    } else if (!user.firebaseUid) {
      // Link existing user to Firebase
      user.firebaseUid = uid;
      await user.save();
      await logActivity('Linked existing MongoDB user to Firebase Auth', email || uid, req.ip || '', 'info');
    }

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({ user });
  } catch (error: any) {
    if (error.code === 11000) {
      // Race condition: another concurrent request just created the user
      try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token && adminAuth) {
          const decoded = await adminAuth.verifyIdToken(token);
          const user = await User.findOne({ email: decoded.email });
          if (user) {
            res.status(200).json({ user });
            return;
          }
        }
      } catch (e) {
        // Fallback to error
      }
    }
    console.error('Failed to sync user:', error);
    res.status(500).json({ message: 'Failed to sync user.', error: error.message || String(error) });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Not logged in.' });
    return;
  }
  res.status(200).json({ user: req.user });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not logged in.' });
      return;
    }

    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid profile data.', errors: parsed.error.format() });
      return;
    }

    const { firstName, lastName, phone } = parsed.data;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone })
      },
      { new: true, runValidators: true }
    );

    await logActivity('Updated profile details', req.user.email, req.ip || '', 'info');

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.', error: (error as Error).message });
  }
};

export const getCustomers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const customers = await User.aggregate([
      { $match: { role: 'customer' } },
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'customerId',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          totalRentals: { $size: '$bookings' },
          status: {
            $cond: {
              if: { $gte: [{ $size: '$bookings' }, 5] },
              then: 'VIP',
              else: {
                $cond: {
                  if: { $gt: [{ $size: '$bookings' }, 0] },
                  then: 'Active',
                  else: 'Pending'
                }
              }
            }
          }
        }
      },
      { $project: { bookings: 0, passwordHash: 0 } },
      { $sort: { createdAt: -1 } }
    ]);
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch customer directory.',
      error: (error as Error).message
    });
  }
};

export const getEmployees = async (_req: Request, res: Response): Promise<void> => {
  try {
    const employees = await User.find({ role: { $in: ['staff', 'admin'] } }).sort({ createdAt: -1 });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch employee directory.',
      error: (error as Error).message
    });
  }
};

export const addCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, passport } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    const newCustomer = await User.create({
      firstName,
      lastName,
      email,
      phone: phone || '0000000000',
      passport,
      role: 'customer'
    });

    res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create customer', error: (error as Error).message });
  }
};

export const getCustomerDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await User.findById(id);
    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    const bookings = await Booking.find({ customerId: id })
      .populate('atvId')
      .sort({ startDate: -1 });

    const totalRentals = bookings.length;
    const totalSpend = 0; // Total spend calculation moved to Payments/Invoices
    
    let status = 'Pending';
    if (totalRentals >= 5) status = 'VIP';
    else if (totalRentals > 0) status = 'Active';

    res.status(200).json({
      customer,
      metrics: {
        totalRentals,
        totalSpend,
        status
      },
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch customer details', error: (error as Error).message });
  }
};

// Password flows



