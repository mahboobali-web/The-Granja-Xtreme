import { Request, Response } from 'express';
import { Invoice } from '../models/invoice.model';
import { Payment } from '../models/payment.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { resolveDateBounds } from '../utils/dateFilter';

export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchQuery: any = {};
    if (req.query.period !== 'All' && (req.query.period || req.query.startDate || req.query.endDate || req.query.month)) {
      const { startDate, endDate } = resolveDateBounds(req.query);
      if (startDate && endDate) {
        matchQuery.createdAt = { $gte: startDate, $lte: endDate };
      }
    }

    const invoices = await Invoice.find(matchQuery)
      .populate('customerId')
      .populate('atvId')
      .populate('bookingId')
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: (error as Error).message });
  }
};

export const getMyInvoices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const invoices = await Invoice.find({ customerId: req.user?._id })
      .populate('atvId')
      .populate('bookingId')
      .populate('orderId')
      .sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: (error as Error).message });
  }
};

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchQuery: any = {};
    if (req.query.period !== 'All' && (req.query.period || req.query.startDate || req.query.endDate || req.query.month)) {
      const { startDate, endDate } = resolveDateBounds(req.query);
      if (startDate && endDate) {
        matchQuery.collectionDate = { $gte: startDate, $lte: endDate };
      }
    }

    const payments = await Payment.find(matchQuery)
      .populate('customerId')
      .sort({ collectionDate: -1, createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: (error as Error).message });
  }
};
