import mongoose from 'mongoose';
import { createBooking } from './src/controllers/booking.controller';
import { Atv } from './src/models/atv.model';
import { User } from './src/models/user.model';
import dotenv from 'dotenv';
dotenv.config();

const runTest = async () => {
  await mongoose.connect(process.env.MONGODB_URI || '');
  
  // Get an ATV and a User
  const atv = await Atv.findOne();
  const user = await User.findOne();
  
  if (!atv || !user) {
    console.log('No ATV or User found');
    process.exit(1);
  }
  
  const req: any = {
    user: user,
    body: {
      atvId: atv._id.toString(),
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      notes: 'Test note'
    },
    ip: '127.0.0.1'
  };
  
  const res: any = {
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    json: function(data: any) {
      console.log('STATUS:', this.statusCode);
      console.log('RESPONSE:', JSON.stringify(data, null, 2));
    }
  };
  
  try {
    await createBooking(req, res);
  } catch (e) {
    console.error('EXCEPTION:', e);
  }
  
  process.exit(0);
};

runTest();
