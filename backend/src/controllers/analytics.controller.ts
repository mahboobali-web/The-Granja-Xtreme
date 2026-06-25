import { Request, Response } from 'express';
import { Booking } from '../models/booking.model';
import { Atv } from '../models/atv.model';
import { User } from '../models/user.model';
import { Payment } from '../models/payment.model';
import { Invoice } from '../models/invoice.model';

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'All';
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    const now = new Date();

    if (period === 'Daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
    } else if (period === 'Weekly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date();
    } else if (period === 'Monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate.setDate(startDate.getDate() - 30);
      endDate = new Date();
    } else if (period === 'Yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    }

    const paymentMatchQuery: any = {};
    const bookingMatchQuery: any = { status: { $ne: 'Pending' } };
    if (startDate && endDate) {
      paymentMatchQuery.createdAt = { $gte: startDate, $lte: endDate };
      bookingMatchQuery.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Total Revenue
    const totalRevAgg = await Payment.aggregate([
      { $match: paymentMatchQuery },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevAgg[0]?.total || 0;

    // Booking Counts
    const totalBookings = await Booking.countDocuments(bookingMatchQuery);
    const activeRentals = await Booking.countDocuments({ status: 'Active' });
    const completedRentals = await Booking.countDocuments({ status: 'Completed' });
    const cancelledRentals = await Booking.countDocuments({ status: 'Cancelled' });

    // Fleet Statuses
    const availableAtvs = await Atv.countDocuments({ status: 'AVAILABLE' });
    const rentedAtvs = await Atv.countDocuments({ status: 'RENTED' });
    const maintenanceAtvs = await Atv.countDocuments({ status: 'MAINTENANCE' });

    // Customer Count
    const customerCount = await User.countDocuments({ role: 'customer', ...paymentMatchQuery });

    // Outstanding Revenue
    const outstandingAgg = await Invoice.aggregate([{ $match: { status: { $ne: 'Paid' } } }, { $group: { _id: null, total: { $sum: '$balance' } } }]);
    const outstandingRevenue = outstandingAgg[0]?.total || 0;

    // Damage Charges
    const damageAgg = await Invoice.aggregate([{ $match: { invoiceType: 'Damage Charge' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const damageCharges = damageAgg[0]?.total || 0;

    // Monthly Revenue
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevAgg = await Payment.aggregate([
      { $match: { collectionDate: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyRevenue = monthlyRevAgg[0]?.total || 0;

    res.status(200).json({
      totalRevenue,
      outstandingRevenue,
      damageCharges,
      monthlyRevenue,
      totalBookings,
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
    let startDate = new Date();
    let endDate = new Date();
    const period = req.query.period as string;
    const now = new Date();
    let format = "%Y-%m-%d";

    if (req.query.month) {
      const [year, month] = (req.query.month as string).split('-');
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    } else if (period === 'Daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
      format = "%Y-%m-%d %H:00";
    } else if (period === 'Weekly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'Monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === 'Yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      format = "%Y-%m";
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate.setDate(startDate.getDate() - 30);
    }

    const revenueByDay = await Payment.aggregate([
      { $match: { collectionDate: { $gte: startDate, $lte: endDate } } },
      { 
        $group: { 
          _id: { $dateToString: { format: format, date: "$collectionDate" } }, 
          total: { $sum: "$amount" } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json(revenueByDay);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to compute revenue analytics', error: err.message });
  }
};

export const getBookingAnalytics = async (_req: Request, res: Response) => {
  try {
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.status(200).json(bookingsByStatus);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to compute booking analytics', error: err.message });
  }
};

export const getFleetAnalytics = async (_req: Request, res: Response) => {
  try {
    const fleetStatus = await Atv.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const mostRented = await Booking.aggregate([
      { $match: { status: { $in: ['Completed', 'Active', 'Reserved', 'Upcoming', 'Pending'] } } },
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

export const getCustomerAnalytics = async (_req: Request, res: Response) => {
  try {
    const topCustomers = await Booking.aggregate([
      { $match: { status: { $in: ['Completed', 'Active', 'Reserved'] } } },
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
