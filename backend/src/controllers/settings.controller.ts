import { Request, Response } from 'express';
import { Settings } from '../models/settings.model';
import { User } from '../models/user.model';
import { Booking } from '../models/booking.model';
import { Atv } from '../models/atv.model';
import { Invoice } from '../models/invoice.model';
import { ContactMessage } from '../models/contact_message.model';
import { z } from 'zod';
import { logActivity } from './logs.controller';

const settingsUpdateSchema = z.object({
  baseTaxRate: z.number().optional(),
  securityDeposit: z.number().optional(),
  operatingHours: z.object({
    open: z.string(),
    close: z.string()
  }).optional(),
  currency: z.string().optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  cancellationPolicy: z.string().optional(),
  sessionTimeoutMinutes: z.number().optional()
});

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings.', error: (error as Error).message });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = settingsUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid settings data.', errors: parsed.error.format() });
      return;
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(parsed.data);
    } else {
      Object.assign(settings, parsed.data);
    }

    await settings.save();

    await logActivity('Updated system settings', (req as any).user?.email || 'admin', req.ip || '', 'warning');

    res.status(200).json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings.', error: (error as Error).message });
  }
};

export const exportDatabase = async (req: Request, res: Response): Promise<void> => {
  try {
    const [settings, users, bookings, atvs, invoices, messages] = await Promise.all([
      Settings.find(),
      User.find(),
      Booking.find(),
      Atv.find(),
      Invoice.find(),
      ContactMessage.find()
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      data: {
        settings,
        users,
        bookings,
        atvs,
        invoices,
        messages
      }
    };

    await logActivity('Downloaded database backup', (req as any).user?.email || 'admin', req.ip || '', 'info');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup_${new Date().toISOString().split('T')[0]}.json"`);
    res.status(200).send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    res.status(500).json({ message: 'Failed to export database.', error: (error as Error).message });
  }
};
