import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Booking } from './src/models/booking.model';
import { Invoice } from './src/models/invoice.model';

dotenv.config();

async function deleteTestBooking() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/granja_xtreme');
  console.log('Connected to DB');

  const bookings = await Booking.find({});
  const testBooking = bookings.find(b => b._id.toString().toLowerCase().endsWith('b39e14'));

  if (!testBooking) {
    console.log('Could not find booking ending with b39e14');
    process.exit(1);
  }

  console.log(`Found test booking: ${testBooking.bookingNumber} with ID: ${testBooking._id}`);
  
  // Delete the invoice associated with this booking
  const invoiceDeleteResult = await Invoice.deleteMany({ bookingId: testBooking._id });
  console.log(`Deleted ${invoiceDeleteResult.deletedCount} associated invoices.`);

  // Delete the booking itself
  await Booking.deleteOne({ _id: testBooking._id });
  console.log('Successfully deleted the test booking.');

  process.exit(0);
}

deleteTestBooking().catch(console.error);
