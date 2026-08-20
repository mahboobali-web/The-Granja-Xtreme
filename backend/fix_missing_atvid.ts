import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Booking } from './src/models/booking.model';
import { Invoice } from './src/models/invoice.model';

dotenv.config();

async function fixBookings() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/granja_xtreme');
  console.log('Connected to DB');

  const bookings = await Booking.find({});
  let fixedCount = 0;

  for (const booking of bookings) {
    let needsSave = false;

    if (!booking.atvId && booking.atvIds && booking.atvIds.length > 0) {
      booking.atvId = booking.atvIds[0];
      needsSave = true;
    }

    if (!booking.finalTotal || booking.finalTotal === 0) {
      const invoice = await Invoice.findOne({ bookingId: booking._id, invoiceType: 'Rental Charge' });
      if (invoice && invoice.amount > 0) {
        booking.finalTotal = invoice.amount;
        needsSave = true;
      }
    }

    if (needsSave) {
      await booking.save();
      console.log(`Updated booking ${booking.bookingNumber} with atvId/finalTotal`);
      fixedCount++;
    }
  }

  console.log(`Fixed ${fixedCount} bookings.`);
  process.exit(0);
}

fixBookings().catch(console.error);
