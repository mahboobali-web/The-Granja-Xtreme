import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Booking } from './src/models/booking.model';
import { Invoice } from './src/models/invoice.model';
import { Atv } from './src/models/atv.model';
import { Settings } from './src/models/settings.model';

dotenv.config();

async function fixZeroInvoices() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/granja_xtreme');
  console.log('Connected to DB');

  const settings = await Settings.findOne();
  const taxRate = settings ? settings.baseTaxRate : 10;
  const securityDepositAmt = settings ? settings.securityDeposit : 150;

  const bookings = await Booking.find({});
  let fixedCount = 0;

  for (const booking of bookings) {
    const invoice = await Invoice.findOne({ bookingId: booking._id, invoiceType: 'Rental Charge' });
    
    if (invoice && (invoice.amount === 0 || booking.finalTotal === 0 || !booking.finalTotal)) {
      // Calculate total
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      
      const atvIds = booking.atvIds && booking.atvIds.length > 0 ? booking.atvIds : (booking.atvId ? [booking.atvId] : []);
      const atvs = await Atv.find({ _id: { $in: atvIds } });
      
      let baseRate = 0;
      for (const atv of atvs) {
        baseRate += (atv.ratePerDay || 0) * days;
      }
      
      const tax = Math.round(baseRate * (taxRate / 100) * 100) / 100;
      const total = baseRate + tax + securityDepositAmt;

      booking.finalTotal = total;
      await booking.save();

      invoice.amount = total;
      invoice.balance = total;
      await invoice.save();

      console.log(`Updated invoice and booking ${booking.bookingNumber} to correct total: $${total}`);
      fixedCount++;
    }
  }

  console.log(`Fixed ${fixedCount} zero-dollar invoices.`);
  process.exit(0);
}

fixZeroInvoices().catch(console.error);
