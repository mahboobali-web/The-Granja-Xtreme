require('dotenv').config();
const mongoose = require('mongoose');
const { Booking } = require('./src/models/booking.model');
const { Invoice } = require('./src/models/invoice.model');
const { Counter } = require('./src/models/counter.model');

async function getNextTgxNumber(type) {
  const counter = await Counter.findOneAndUpdate(
    { name: type },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const prefix = type === 'invoice' ? 'INV' : type === 'booking' ? 'BK' : 'TGX';
  return `${prefix}-${counter.seq.toString().padStart(4, '0')}`;
}

async function fixInvoices() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/granja_xtreme');
  console.log('Connected to DB');

  const bookings = await Booking.find({});
  let fixedCount = 0;

  for (const booking of bookings) {
    const invoice = await Invoice.findOne({ bookingId: booking._id, invoiceType: 'Rental Charge' });
    if (!invoice) {
      console.log(`Missing invoice for booking ${booking.bookingNumber}. Creating...`);
      
      const invoiceNumber = await getNextTgxNumber('invoice');
      const durationMs = booking.endDate.getTime() - booking.startDate.getTime();
      const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1);
      
      // We don't have exact rate if it's missing, but we can set 0 and admin can update,
      // or we just use finalTotal if available
      const total = booking.finalTotal || 0;
      
      const atvId = booking.atvId || (booking.atvIds && booking.atvIds.length > 0 ? booking.atvIds[0] : null);
      if (!atvId) {
        console.log(`Booking ${booking.bookingNumber} has no ATV assigned, skipping invoice creation.`);
        continue;
      }

      await Invoice.create({
        invoiceNumber,
        bookingId: booking._id,
        customerId: booking.customerId,
        atvId: atvId,
        invoiceType: 'Rental Charge',
        description: `Admin created reservation`,
        amount: total,
        balance: total,
        status: 'Unpaid',
        dueDate: new Date(booking.startDate)
      });
      console.log(`Created invoice ${invoiceNumber} for booking ${booking.bookingNumber}`);
      fixedCount++;
    }
  }

  console.log(`Fixed ${fixedCount} missing invoices.`);
  process.exit(0);
}

fixInvoices().catch(console.error);
