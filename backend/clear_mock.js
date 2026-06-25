const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const db = mongoose.connection.db;

    // Delete mock transactional data
    const bookingsResult = await db.collection('bookings').deleteMany({});
    console.log(`Cleared ${bookingsResult.deletedCount} bookings`);
    
    const waiversResult = await db.collection('waivers').deleteMany({});
    console.log(`Cleared ${waiversResult.deletedCount} waivers (contracts)`);

    const activityLogsResult = await db.collection('activitylogs').deleteMany({});
    console.log(`Cleared ${activityLogsResult.deletedCount} activitylogs`);

    console.log('Successfully wiped all mock transactional data.');
  } catch (err) {
    console.error('Error clearing data:', err);
  } finally {
    process.exit(0);
  }
}
run();
