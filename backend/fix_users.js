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

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');
const auth = getAuth();

async function ensureUser(email, password, role) {
  let firebaseUser;
  try {
    firebaseUser = await auth.getUserByEmail(email);
    console.log(`Updating Firebase password for ${email}`);
    await auth.updateUser(firebaseUser.uid, { password });
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      console.log(`Creating Firebase user for ${email}`);
      firebaseUser = await auth.createUser({ email, password });
    } else {
      console.error(e);
      return;
    }
  }

  // Find by email or firebaseUid
  let dbUser = await User.findOne({ $or: [{ email }, { firebaseUid: firebaseUser.uid }] });
  if (dbUser) {
    console.log(`Updating MongoDB user (currently ${dbUser.email}) to role ${role}`);
    await User.updateOne({ _id: dbUser._id }, { $set: { email, role, firebaseUid: firebaseUser.uid } });
  } else {
    console.log(`Creating MongoDB user for ${email} with role ${role}`);
    await User.create({
      email,
      firebaseUid: firebaseUser.uid,
      firstName: email.split('@')[0],
      lastName: 'Admin',
      phone: '0000000000',
      role,
      status: 'active'
    });
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  await ensureUser('admin@granjaxtreme.com', 'password123', 'admin');
  await ensureUser('testemployee2@gmail.com', 'Test123', 'staff');
  
  console.log("Done");
  process.exit(0);
}
run();
