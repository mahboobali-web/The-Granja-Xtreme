const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const mongoose = require('mongoose');
require('dotenv').config();

let serviceAccount = undefined;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
  if (raw.startsWith("'") && raw.endsWith("'")) {
    raw = raw.slice(1, -1);
  }
  serviceAccount = JSON.parse(raw);
}

if (!getApps().length && serviceAccount) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const auth = getAuth();

async function deleteAllFirebaseUsers() {
  let nextPageToken;
  let deletedCount = 0;
  console.log('Fetching Firebase users to delete...');
  do {
    const listUsersResult = await auth.listUsers(1000, nextPageToken);
    const uids = listUsersResult.users.map(u => u.uid);
    if (uids.length > 0) {
      const deleteResult = await auth.deleteUsers(uids);
      console.log(`Deleted ${deleteResult.successCount} users from Firebase Auth.`);
      deletedCount += deleteResult.successCount;
    }
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);
  console.log(`Total Firebase users deleted: ${deletedCount}`);
}

async function wipeDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const collectionsToDrop = [
    'users',
    'bookings',
    'payments',
    'invoices',
    'waivers',
    'activitylogs',
    'contactmessages',
    'inspections',
    'maintenances',
    'notifications',
    'reviews'
  ];

  for (const collectionName of collectionsToDrop) {
    try {
      await mongoose.connection.db.dropCollection(collectionName);
      console.log(`Dropped collection: ${collectionName}`);
    } catch (e) {
      if (e.code === 26) {
        console.log(`Collection ${collectionName} does not exist. Skipping.`);
      } else {
        console.error(`Error dropping collection ${collectionName}:`, e.message);
      }
    }
  }

  // Also reset counters except those that we don't want. 
  // Wait, let's just drop the counters collection altogether so they reset to 1.
  try {
    await mongoose.connection.db.dropCollection('counters');
    console.log(`Dropped collection: counters`);
  } catch (e) {
    console.log(`Collection counters does not exist. Skipping.`);
  }

  console.log('Database wipe complete.');
}

async function run() {
  try {
    await deleteAllFirebaseUsers();
    await wipeDatabase();
    console.log("Wipe script finished successfully!");
  } catch (err) {
    console.error("Error during wipe script:", err);
  } finally {
    process.exit(0);
  }
}

run();
