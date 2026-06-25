const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await User.findOne({ email: 'admin@granjaxtreme.com' });
  const emp = await User.findOne({ email: 'testemployee2@gmail.com' });
  
  console.log("Admin:", admin);
  console.log("Employee:", emp);
  process.exit(0);
}
run();
