import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Order } from '../models/order.model';

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'firstName lastName email phone')
      .populate('items.accessoryId', 'name')
      .populate('invoiceId')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};
