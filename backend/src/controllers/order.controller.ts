import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Order } from '../models/order.model';
import { resolveDateBounds } from '../utils/dateFilter';

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const matchQuery: any = {};
    if (req.query.period !== 'All' && (req.query.period || req.query.startDate || req.query.endDate || req.query.month)) {
      const { startDate, endDate } = resolveDateBounds(req.query);
      if (startDate && endDate) {
        matchQuery.createdAt = { $gte: startDate, $lte: endDate };
      }
    }

    const orders = await Order.find(matchQuery)
      .populate('customerId', 'firstName lastName email phone')
      .populate('items.accessoryId', 'name')
      .populate('invoiceId')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};
