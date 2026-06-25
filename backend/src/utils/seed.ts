import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { Settings } from '../models/settings.model';
import { CmsContent } from '../models/cms.model';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is not defined in .env');

    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding');

    // 1. Seed Admin User
    let adminUser = await User.findOne({ email: 'admin@granjaxtreme.com' });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      adminUser = await User.create({
        email: 'admin@granjaxtreme.com',
        passwordHash: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        phone: '1234567890',
        role: 'admin',
        status: 'active'
      });
      console.log('Admin user seeded (admin@granjaxtreme.com / admin123)');
    } else {
      console.log('Admin user already exists.');
    }

    // 2. Seed Settings
    const settingsExist = await Settings.findOne();
    if (!settingsExist) {
      await Settings.create({
        baseTaxRate: 8.5,
        securityDeposit: 500,
        operatingHours: { open: '08:00', close: '18:00' }
      });
      console.log('Default settings seeded.');
    } else {
      console.log('Settings already exist.');
    }

    // 3. Seed CMS (Homepage, About, Contact)
    const cmsExist = await CmsContent.findOne({ key: 'homepage' });
    if (!cmsExist) {
      await CmsContent.create([
        {
          key: 'homepage',
          value: {
            heroTitle: 'Experience the Xtreme',
            heroSubtitle: 'ATV rentals for the ultimate adventure.',
            featuredImageId: 'default-hero.jpg'
          },
          updatedBy: adminUser._id
        },
        {
          key: 'about',
          value: {
            title: 'Our Story',
            content: 'The Granja Xtreme was founded to bring adrenaline to everyone.',
            imageIds: ['story-1.jpg', 'story-2.jpg']
          },
          updatedBy: adminUser._id
        },
        {
          key: 'contact',
          value: {
            email: 'info@granjaxtreme.com',
            phone: '+1 555-0198',
            address: '123 Adventure Way, PR',
            socialLinks: {
              facebook: 'https://facebook.com/granjaxtreme',
              instagram: 'https://instagram.com/granjaxtreme'
            }
          },
          updatedBy: adminUser._id
        }
      ]);
      console.log('Default CMS content seeded.');
    } else {
      console.log('CMS content already exists.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
