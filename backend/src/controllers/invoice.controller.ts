import { Request, Response } from 'express';
import { Invoice } from '../models/invoice.model';
import { Payment } from '../models/payment.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getInvoices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await Invoice.find().populate('customerId').populate('atvId').populate('bookingId').sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: (error as Error).message });
  }
};

export const getMyInvoices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const invoices = await Invoice.find({ customerId: req.user?._id }).populate('atvId').sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: (error as Error).message });
  }
};

export const getPayments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const payments = await Payment.find().populate('customerId').sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: (error as Error).message });
  }
};
