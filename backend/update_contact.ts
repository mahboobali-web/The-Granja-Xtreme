import mongoose from 'mongoose';
import { CmsContent } from './src/models/cms.model';
import dotenv from 'dotenv';
dotenv.config();

const updateContact = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/granja_xtreme');
  
  const content = await CmsContent.findOne({ key: 'contact_info' });
  if (content) {
    content.value.email = 'tgranjaxtreme065@gmail.com';
    content.value.phone = '+1 809-622-4122';
    content.value.address = 'Calle Los Hidalgos, Sector Majagual, Sánchez, Samaná, Dominican Republic';
    content.value.businessHours = 'Monday-Sunday 8:00 AM - 6:00 PM';
    
    // We must use markModified if it's a mixed type
    content.markModified('value');
    await content.save();
    console.log('Successfully updated contact_info in CMS DB.');
  } else {
    console.log('No contact_info found in DB, it will use defaults.');
  }
  
  process.exit(0);
};

updateContact();
