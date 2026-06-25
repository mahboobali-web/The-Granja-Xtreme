import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { Atv } from '../models/atv.model';
import { CmsContent } from '../models/cms.model';
import fs from 'fs';
import path from 'path';

dotenv.config();

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadToCloudinary = async (imagePathOrUrl: string, folder: string): Promise<string | null> => {
    try {
        if (!imagePathOrUrl) return null;
        if (imagePathOrUrl.startsWith('http') && imagePathOrUrl.includes('cloudinary')) {
            // Already uploaded
            return imagePathOrUrl;
        }

        let uploadSource = imagePathOrUrl;

        // If local path starting with /images/
        if (imagePathOrUrl.startsWith('/images/')) {
            // resolve path
            const frontendPublic = path.resolve(__dirname, '../../../frontend/public');
            const localFile = path.join(frontendPublic, imagePathOrUrl);
            
            if (fs.existsSync(localFile)) {
                // Read local file as base64
                const fileData = fs.readFileSync(localFile, { encoding: 'base64' });
                const mimeType = localFile.endsWith('.png') ? 'image/png' : 'image/jpeg';
                uploadSource = `data:${mimeType};base64,${fileData}`;
            } else {
                console.warn(`Local file not found: ${localFile}`);
                return null;
            }
        }

        const result = await cloudinary.uploader.upload(uploadSource, { folder: `granjaxtreme/${folder}` });
        return result.secure_url;
    } catch (err: any) {
        console.error(`Failed to upload ${imagePathOrUrl}:`, err.message);
        return null;
    }
}

const runMigration = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI is not defined in .env');

        await mongoose.connect(mongoUri);
        console.log('Connected to DB for Image Migration');

        console.log('--- Migrating ATVs ---');
        const atvs = await Atv.find();
        for (const atv of atvs) {
            let modified = false;
            const newImages = [];
            for (const img of atv.images) {
                const newUrl = await uploadToCloudinary(img, 'atvs');
                if (newUrl && newUrl !== img) {
                    newImages.push(newUrl);
                    modified = true;
                } else {
                    newImages.push(img);
                }
            }
            if (modified) {
                atv.images = newImages;
                await atv.save();
                console.log(`Updated images for ATV: ${atv.model}`);
            }
        }

        console.log('--- Migrating CMS Content ---');
        const cmsContent = await CmsContent.find();
        for (const cms of cmsContent) {
            let modified = false;

            if (cms.key === 'homepage') {
                const val = cms.value;
                
                // Check gallery
                if (val.homepage_gallery && Array.isArray(val.homepage_gallery.items)) {
                    for (const item of val.homepage_gallery.items) {
                        const newUrl = await uploadToCloudinary(item.url, 'gallery');
                        if (newUrl && newUrl !== item.url) {
                            item.url = newUrl;
                            modified = true;
                        }
                    }
                }

                // Check hero banner
                if (val.homepage_hero && val.homepage_hero.bannerUrl) {
                    const newUrl = await uploadToCloudinary(val.homepage_hero.bannerUrl, 'hero');
                    if (newUrl && newUrl !== val.homepage_hero.bannerUrl) {
                        val.homepage_hero.bannerUrl = newUrl;
                        modified = true;
                    }
                }

                if (modified) {
                    cms.markModified('value');
                    await cms.save();
                    console.log('Updated homepage CMS images');
                }
            } else if (cms.key === 'about') {
                const val = cms.value;
                if (val.story_content && Array.isArray(val.story_content.team)) {
                    for (const member of val.story_content.team) {
                        const newUrl = await uploadToCloudinary(member.img, 'team');
                        if (newUrl && newUrl !== member.img) {
                            member.img = newUrl;
                            modified = true;
                        }
                    }
                }
                if (modified) {
                    cms.markModified('value');
                    await cms.save();
                    console.log('Updated about CMS images (Team)');
                }
            }
        }

        console.log('Migration Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
