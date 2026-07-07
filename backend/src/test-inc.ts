import 'dotenv/config';
import { connectDB } from './config/db';
import { Accessory } from './models/accessory.model';

const testInc = async () => {
  try {
    await connectDB();
    const acc = await Accessory.findOne();
    if (!acc) {
      console.log('No accessory found.');
      process.exit(0);
    }
    console.log('Before:', acc.quantity);

    const updated = await Accessory.findByIdAndUpdate(acc._id, {
      $inc: { quantity: -3 }
    }, { new: true });
    
    console.log('After:', updated?.quantity);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testInc();
