const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find duplicate emails
  const users = await User.find({ email: 'tgranjaxtreme065@gmail.com' }).sort({ createdAt: 1 });
  if (users.length > 1) {
    console.log("Found duplicates, deleting older/unknown ones...");
    // Keep the first one with a valid name, or just the first one.
    // The user screenshot shows "User Unknown" as the bottom one. Let's delete the one with "firstName": "User"
    for (let i = 0; i < users.length; i++) {
      if (users[i].firstName === 'User') {
        console.log(`Deleting duplicate: ${users[i]._id}`);
        await User.deleteOne({ _id: users[i]._id });
      }
    }
  }

  try {
    // Re-create indexes
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoose.connection.db.collection('users').createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });
    console.log("Indexes rebuilt.");
  } catch(e) {
    console.log("Index creation failed, maybe still duplicates:", e.message);
  }

  process.exit(0);
}
run();
