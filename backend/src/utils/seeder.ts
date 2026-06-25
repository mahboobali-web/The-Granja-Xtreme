import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/user.model';
import { Atv } from '../models/atv.model';

dotenv.config();

const seedData = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/granja_xtreme';
    await mongoose.connect(connUri);
    console.log('Connected to DB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Atv.deleteMany({});
    console.log('Cleared existing user and ATV collections.');

    // 1. Create Admin User
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('password123', salt);
    
    await User.create({
      email: 'admin@granjaxtreme.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Staff',
      phone: '+1 (555) 019-9180',
      role: 'admin',
      status: 'active'
    });
    console.log('Admin user seeded: admin@granjaxtreme.com / password123');

    // 2. Create Premium ATVs
    const seededAtvs = [
      {
        name: 'Yamaha Grizzly 700',
        model: 'EPS Special Edition',
        year: 2024,
        status: 'AVAILABLE',
        ratePerDay: 180,
        hourlyRate: 35,
        description: 'Yamaha\'s premier trail four-wheeler, featuring Electric Power Steering (EPS), high-performance Maxxis tires, and superior 4WD trail capability.',
        specs: {
          displacement: '686 cc',
          fuelCapacity: '4.76 gal',
          weightLimit: '485 lbs'
        },
        images: ['/images/yamaha_grizzly.png'],
        currentOdometer: 120,
        currentFuelLevel: 100
      },
      {
        name: 'Can-Am Outlander MAX',
        model: 'XT-P Mud Edition',
        year: 2024,
        status: 'AVAILABLE',
        ratePerDay: 220,
        hourlyRate: 45,
        description: 'Relocated engine air intakes, snorkel radiator setup, and aggressive mud-biting tires. The absolute king of rough terrains.',
        specs: {
          displacement: '850 cc',
          fuelCapacity: '5.4 gal',
          weightLimit: '530 lbs'
        },
        images: ['/images/canam_outlander.png'],
        currentOdometer: 85,
        currentFuelLevel: 100
      },
      {
        name: 'Polaris Scrambler XP',
        model: 'S 1000 Sport',
        year: 2024,
        status: 'AVAILABLE',
        ratePerDay: 290,
        hourlyRate: 55,
        description: 'Flagship racing sport ATV, with dual A-arm suspension and extreme Walker Evans shock systems.',
        specs: {
          displacement: '952 cc',
          fuelCapacity: '5.25 gal',
          weightLimit: '450 lbs'
        },
        images: ['/images/polaris_scrambler.png'],
        currentOdometer: 210,
        currentFuelLevel: 100
      },
      {
        name: 'Honda Rubicon 520',
        model: 'DCT EPS Deluxe',
        year: 2024,
        status: 'AVAILABLE',
        ratePerDay: 165,
        hourlyRate: 30,
        description: 'Ultra-reliable utility workhorse with automatic dual-clutch transmission and electric power steering.',
        specs: {
          displacement: '518 cc',
          fuelCapacity: '3.8 gal',
          weightLimit: '485 lbs'
        },
        images: ['/images/honda_rubicon.png'],
        currentOdometer: 140,
        currentFuelLevel: 100
      },
      {
        name: 'Kawasaki Brute Force',
        model: '750 4x4i EPS',
        year: 2024,
        status: 'AVAILABLE',
        ratePerDay: 195,
        hourlyRate: 40,
        description: 'V-twin power on a rugged chassis, built for tough work, farming, and ultimate trail comfort.',
        specs: {
          displacement: '749 cc',
          fuelCapacity: '5.3 gal',
          weightLimit: '530 lbs'
        },
        images: ['/images/kawasaki_brute.png'],
        currentOdometer: 95,
        currentFuelLevel: 100
      },
      {
        name: 'Suzuki KingQuad 750',
        model: 'AXi Power Steering',
        year: 2024,
        status: 'AVAILABLE',
        ratePerDay: 185,
        hourlyRate: 38,
        description: 'Flagship Suzuki utility quad, combining smooth V-twin power, independent suspension, and locking front differential.',
        specs: {
          displacement: '722 cc',
          fuelCapacity: '4.6 gal',
          weightLimit: '530 lbs'
        },
        images: ['/images/suzuki_kingquad.png'],
        currentOdometer: 110,
        currentFuelLevel: 100
      }
    ];

    await Atv.create(seededAtvs);
    console.log('6 Premium ATVs seeded successfully.');

    await mongoose.connection.close();
    console.log('Seeder run complete.');
  } catch (error) {
    console.error('Seeder execution error:', error);
    process.exit(1);
  }
};

seedData();
