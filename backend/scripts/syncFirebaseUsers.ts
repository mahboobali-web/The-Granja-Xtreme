import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '../.env') });

// Now import the rest using require to avoid hoisting
const { User } = require('../src/models/user.model');
const { adminAuth } = require('../src/config/firebase-admin');
const syncUsers = async () => {
  if (!adminAuth) {
    console.error('Firebase Admin not initialized. Exiting.');
    return;
  }

  try {
    // Connect to MongoDB
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB.');

    const users = await User.find();
    console.log(`Found ${users.length} users in MongoDB.`);

    let successCount = 0;
    let failedCount = 0;

    for (const user of users) {
      if (!user.email) continue;

      try {
        // Check if user already exists in Firebase by email
        let existingUser;
        try {
          existingUser = await adminAuth.getUserByEmail(user.email);
        } catch (e: any) {
          if (e.code !== 'auth/user-not-found') {
            throw e;
          }
        }

        if (existingUser) {
          console.log(`User ${user.email} already exists in Firebase with UID: ${existingUser.uid}`);
          
          // If MongoDB firebaseUid is different or missing, update MongoDB to match Firebase
          if (user.firebaseUid !== existingUser.uid) {
            user.firebaseUid = existingUser.uid;
            await user.save();
            console.log(`Updated MongoDB firebaseUid for ${user.email} to match Firebase.`);
          }
          successCount++;
          continue;
        }

        // Prepare new user payload
        const newUserData: any = {
          email: user.email,
          emailVerified: true,
          displayName: `${user.firstName} ${user.lastName}`.trim(),
        };

        // If they had a specific firebaseUid in MongoDB, preserve it in Firebase
        if (user.firebaseUid) {
          newUserData.uid = user.firebaseUid;
        }

        // We do NOT set a password here; users will use "Forgot Password" or Google Sign-In.
        // If you absolutely need a temporary password:
        // newUserData.password = 'TempPass123!';

        const createdUser = await adminAuth.createUser(newUserData);
        console.log(`Created user ${createdUser.email} in Firebase with UID: ${createdUser.uid}`);

        // Update MongoDB if the UID changed (e.g. they didn't have one)
        if (user.firebaseUid !== createdUser.uid) {
          user.firebaseUid = createdUser.uid;
          await user.save();
          console.log(`Updated MongoDB firebaseUid for ${user.email} to new Firebase UID.`);
        }

        successCount++;
      } catch (err: any) {
        console.error(`Failed to sync user ${user.email}:`, err.message);
        failedCount++;
      }
    }

    console.log(`\nSync complete!`);
    console.log(`Successfully synced: ${successCount}`);
    console.log(`Failed: ${failedCount}`);

  } catch (err) {
    console.error('Fatal error during sync:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

syncUsers();
