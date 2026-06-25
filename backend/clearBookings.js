const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to DB');
    const bookings = await mongoose.connection.collection('bookings').deleteMany({});
    const invoices = await mongoose.connection.collection('invoices').deleteMany({});
    const payments = await mongoose.connection.collection('payments').deleteMany({});
    const activity_logs = await mongoose.connection.collection('activity_logs').deleteMany({});
    const waivers = await mongoose.connection.collection('waivers').deleteMany({});
    
    console.log(`Deleted ${bookings.deletedCount} bookings.`);
    console.log(`Deleted ${invoices.deletedCount} invoices.`);
    console.log(`Deleted ${payments.deletedCount} payments.`);
    console.log(`Deleted ${activity_logs.deletedCount} activity_logs.`);
    console.log(`Deleted ${waivers.deletedCount} waivers.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
