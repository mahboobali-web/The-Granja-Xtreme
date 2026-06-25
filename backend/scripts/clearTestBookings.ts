import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import { Booking } from '../src/models/booking.model';
import { Invoice } from '../src/models/invoice.model';
import { Payment } from '../src/models/payment.model';
import { Counter } from '../src/models/counter.model';
import { Waiver } from '../src/models/waiver.model';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clearData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);

    const bRes = await Booking.deleteMany({});
    console.log(`Deleted ${bRes.deletedCount} bookings.`);

    const iRes = await Invoice.deleteMany({});
    console.log(`Deleted ${iRes.deletedCount} invoices.`);

    const pRes = await Payment.deleteMany({});
    console.log(`Deleted ${pRes.deletedCount} payments.`);

    const wRes = await Waiver.deleteMany({});
    console.log(`Deleted ${wRes.deletedCount} waivers.`);

    const cRes = await Counter.deleteMany({
      _id: { $in: ['tgx_booking', 'tgx_invoice', 'tgx_receipt'] }
    });
    console.log(`Reset ${cRes.deletedCount} sequential counters.`);

    console.log('Cleanup completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearData();
