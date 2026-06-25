import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { CmsContent } from '../src/models/cms.model';

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateCms = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // 1. Update Homepage Hero
    const heroContent = await CmsContent.findOne({ key: 'homepage_hero' });
    if (heroContent) {
      // The hero banner background is managed via CSS or style tags normally, 
      // but let's see if the CMS stores an image. In Home.tsx, it didn't seem to, but let's check.
      // Actually, Home.tsx uses hardcoded '/images/hero_home.jpeg' in style, so CMS doesn't need to update it.
    }

    // 2. Update Homepage Gallery
    const galleryItems = [
      { url: '/images/kilyan-sockalingum-cxUgrQapYi4-unsplash.jpg', alt: 'Red ATVs on Trail', category: 'Fleet' },
      { url: '/images/joe-neric-EGzkhZyFRX4-unsplash.jpg', alt: 'ATV Action in Dirt', category: 'Adventure' },
      { url: '/images/joshua-hanson-zCRzigSZsRs-unsplash.jpg', alt: 'Forest Trail Riding', category: 'Adventure' },
      { url: '/images/action_river.jpeg', alt: 'River Crossing', category: 'Adventure' },
      { url: '/images/vasile-valcan-1HqixV1agUw-unsplash.jpg', alt: 'Muddy ATVs', category: 'Fleet' },
      { url: '/images/hero_home.jpeg', alt: 'Couple jumping', category: 'Team' } // Adding more to fit categories
    ];

    await CmsContent.findOneAndUpdate(
      { key: 'homepage_gallery' },
      { value: { items: galleryItems } },
      { upsert: true }
    );
    console.log('Updated homepage_gallery');

    // 3. Update Story Content (to fix the team images if any)
    const story = await CmsContent.findOne({ key: 'story_content' });
    if (story && story.value && story.value.team) {
      story.value.team[0].img = '/images/hero_home.jpeg'; // Use the couple jumping for Team
      await story.save();
      console.log('Updated story_content team images');
    }

    console.log('CMS Update Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to update CMS', error);
    process.exit(1);
  }
};

updateCms();
