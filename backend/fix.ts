import { Accessory } from './src/models/accessory.model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  try {
    const res = await Accessory.deleteMany({ name: 'Test Product' });
    console.log('Deleted Test Product:', res);
  } catch (err) {
    console.error(err);
  }
  process.exit();
});
