import 'dotenv/config';
import { connectDB } from './config/db';
import mongoose from 'mongoose';
import { Booking } from './models/booking.model';
import { Invoice } from './models/invoice.model';
import { Payment } from './models/payment.model';
import { Waiver } from './models/waiver.model';
import { InspectionLog } from './models/inspection.model';

const clearData = async () => {
  try {
    await connectDB();
    console.log('Connected to DB. Clearing collections...');

    await Booking.deleteMany({});
    console.log('Bookings cleared.');

    await Invoice.deleteMany({});
    console.log('Invoices cleared.');

    await Payment.deleteMany({});
    console.log('Payments (receipts) cleared.');

    await Waiver.deleteMany({});
    console.log('Waivers (contracts) cleared.');

    await InspectionLog.deleteMany({});
    console.log('Inspections cleared.');

    console.log('All requested collections cleared successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing collections:', error);
    process.exit(1);
  }
};

clearData();
