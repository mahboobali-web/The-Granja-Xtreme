import { Request, Response } from 'express';
import { Booking } from '../models/booking.model';
import { Order } from '../models/order.model';
import { Atv } from '../models/atv.model';
import { User } from '../models/user.model';
import { Payment } from '../models/payment.model';
import { Invoice } from '../models/invoice.model';
import { resolveDateBounds } from '../utils/dateFilter';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = resolveDateBounds(req.query);

    const paymentMatchQuery: any = {};
    const bookingMatchQuery: any = { status: { $ne: 'Pending' } };
    const invoiceMatchQuery: any = {};

    if (startDate && endDate) {
      paymentMatchQuery.collectionDate = { $gte: startDate, $lte: endDate };
      bookingMatchQuery.createdAt = { $gte: startDate, $lte: endDate };
      invoiceMatchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Total Revenue for period
    const totalRevAgg = await Payment.aggregate([
      { $match: paymentMatchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevAgg[0]?.total || 0;

    // Booking & Order Counts for period
    const orderMatchQuery: any = startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};
    const totalBookings = await Booking.countDocuments(bookingMatchQuery);
    const totalOrders = await Order.countDocuments(orderMatchQuery);
    const activeRentals = await Booking.countDocuments({ status: 'Active' });
    const completedRentals = await Booking.countDocuments({ status: 'Completed', ...bookingMatchQuery });
    const cancelledRentals = await Booking.countDocuments({ status: 'Cancelled', ...(startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {}) });

    // Fleet Statuses (Snapshot)
    const availableAtvs = await Atv.countDocuments({ status: 'AVAILABLE' });
    const rentedAtvs = await Atv.countDocuments({ status: 'RENTED' });
    const maintenanceAtvs = await Atv.countDocuments({ status: 'MAINTENANCE' });

    // Customer Count
    const customerCount = await User.countDocuments({
      role: 'customer',
      ...(startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {})
    });

    // Outstanding Revenue
    const outstandingAgg = await Invoice.aggregate([
      { $match: { status: { $ne: 'Paid' }, ...invoiceMatchQuery } },
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const outstandingRevenue = outstandingAgg[0]?.total || 0;

    // Damage Charges for period
    const damageAgg = await Invoice.aggregate([
      { $match: { invoiceType: 'Damage Charge', ...invoiceMatchQuery } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const damageCharges = damageAgg[0]?.total || 0;

    // Monthly Revenue (Current Calendar Month revenue or Selected Period revenue)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthlyRevAgg = await Payment.aggregate([
      { $match: { collectionDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyRevenue = monthlyRevAgg[0]?.total || 0;

    res.status(200).json({
      totalRevenue,
      outstandingRevenue,
      damageCharges,
      monthlyRevenue,
      periodRevenue: totalRevenue,
      totalBookings,
      totalOrders,
      activeRentals,
      completedRentals,
      cancelledRentals,
      fleet: { available: availableAtvs, rented: rentedAtvs, maintenance: maintenanceAtvs },
      customerCount
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to compute dashboard metrics', error: err.message });
  }
};

export const getRevenueAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = resolveDateBounds(req.query);
    const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate || new Date();

    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    let format = "%Y-%m-%d";
    let isHourly = false;
    let isMonthly = false;

    if (diffDays <= 1.1) {
      format = "%Y-%m-%d %H:00";
      isHourly = true;
    } else if (diffDays > 62) {
      format = "%Y-%m";
      isMonthly = true;
    }

    const revenueAgg = await Payment.aggregate([
      { $match: { collectionDate: { $gte: start, $lte: end } } },
      { 
        $group: { 
          _id: { $dateToString: { format: format, date: "$collectionDate" } }, 
          total: { $sum: "$amount" } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    const revMap = new Map<string, number>();
    revenueAgg.forEach((item: any) => {
      revMap.set(item._id, item.total || 0);
    });

    // Zero-fill gaps in timeline
    const timelineData: Array<{ _id: string; total: number }> = [];

    if (isHourly) {
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = String(hour).padStart(2, '0');
        const key = `${year}-${month}-${day} ${hourStr}:00`;
        timelineData.push({
          _id: key,
          total: revMap.get(key) || 0
        });
      }
    } else if (isMonthly) {
      const curr = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

      while (curr <= endMonth) {
        const year = curr.getFullYear();
        const month = String(curr.getMonth() + 1).padStart(2, '0');
        const key = `${year}-${month}`;
        timelineData.push({
          _id: key,
          total: revMap.get(key) || 0
        });
        curr.setMonth(curr.getMonth() + 1);
      }
    } else {
      const curr = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

      while (curr <= endDay) {
        const year = curr.getFullYear();
        const month = String(curr.getMonth() + 1).padStart(2, '0');
        const day = String(curr.getDate()).padStart(2, '0');
        const key = `${year}-${month}-${day}`;
        timelineData.push({
          _id: key,
          total: revMap.get(key) || 0
        });
        curr.setDate(curr.getDate() + 1);
      }
    }

    res.status(200).json(timelineData);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to compute revenue analytics', error: err.message });
  }
};

export const getBookingAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = resolveDateBounds(req.query);
    const matchQuery: any = {};
    if (startDate && endDate) {
      matchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    const bookingsByStatus = await Booking.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.status(200).json(bookingsByStatus);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to compute booking analytics', error: err.message });
  }
};

export const getFleetAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = resolveDateBounds(req.query);
    const bookingMatch: any = {
      status: { $in: ['Completed', 'Active', 'Reserved', 'Upcoming', 'Pending'] }
    };
    if (startDate && endDate) {
      bookingMatch.createdAt = { $gte: startDate, $lte: endDate };
    }

    const fleetStatus = await Atv.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const mostRented = await Booking.aggregate([
      { $match: bookingMatch },
      { $group: { _id: '$atvId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'atvs', localField: '_id', foreignField: '_id', as: 'atv' } },
      { $unwind: '$atv' },
      { $project: { name: '$atv.name', model: '$atv.model', count: 1 } }
    ]);

    res.status(200).json({ fleetStatus, mostRented });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to compute fleet analytics', error: err.message });
  }
};

export const getCustomerAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = resolveDateBounds(req.query);
    const bookingMatch: any = { status: { $in: ['Completed', 'Active', 'Reserved'] } };
    if (startDate && endDate) {
      bookingMatch.createdAt = { $gte: startDate, $lte: endDate };
    }

    const topCustomers = await Booking.aggregate([
      { $match: bookingMatch },
      { $group: { _id: '$customerId', totalBookings: { $sum: 1 }, totalSpent: { $sum: '$pricing.total' } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { firstName: '$user.firstName', lastName: '$user.lastName', email: '$user.email', totalBookings: 1, totalSpent: 1 } }
    ]);

    res.status(200).json(topCustomers);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to compute customer analytics', error: err.message });
  }
};
