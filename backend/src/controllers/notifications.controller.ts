import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';

export const getUnreadNotifications = async (_req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ isRead: false }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// For testing purposes during dev
export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const notif = await Notification.create(req.body);
    res.status(201).json(notif);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create' });
  }
};
