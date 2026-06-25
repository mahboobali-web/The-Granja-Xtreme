import { Request, Response } from 'express';
import { ActivityLog } from '../models/activity_log.model';

export const getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, type, startDate, endDate, page = '1', limit = '50' } = req.query;

    const query: any = {};

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await ActivityLog.countDocuments(query);

    res.status(200).json({
      logs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch logs.', error: (error as Error).message });
  }
};

export const logActivity = async (action: string, userEmail: string, ipAddress: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  try {
    await ActivityLog.create({ action, userEmail, ipAddress, type });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
};

export const logAuthAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, status } = req.body;
    const ipAddress = req.ip || '';
    const type = status === 'SUCCESS' ? 'success' : 'warning';
    await logActivity(`LOGIN_${status}`, email || 'unknown', ipAddress, type);
    res.status(200).json({ message: 'Log recorded.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record log.' });
  }
};

export const getAuthLogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await ActivityLog.find({ action: { $in: ['LOGIN_SUCCESS', 'LOGIN_FAILED'] } })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch auth logs.' });
  }
};
