import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase-admin';
import { User, IUser } from '../models/user.model';
import { Types } from 'mongoose';

export interface AuthenticatedRequest extends Request {
  user?: IUser & { _id: Types.ObjectId };
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = '';
    
    // Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      res.status(401).json({ message: 'Authentication required. Please log in.' });
      return;
    }

    // Verify token with Firebase
    if (!adminAuth) {
      res.status(500).json({ message: 'Firebase Admin not configured' });
      return;
    }
    
    const decoded = await adminAuth.verifyIdToken(token, true);

    // Find user by firebaseUid or email
    const user = await User.findOne({
      $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }]
    });
    if (!user || user.status === 'suspended') {
      res.status(401).json({ message: 'User not found or account is suspended.' });
      return;
    }

    req.user = user as IUser & { _id: Types.ObjectId };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token or session expired.' });
  }
};

export const restrictTo = (...roles: Array<'customer' | 'staff' | 'admin'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'You do not have permission to perform this action.' });
      return;
    }
    next();
  };
};
