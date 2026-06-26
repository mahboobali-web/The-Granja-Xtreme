import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import https from 'https';

dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const BACKUP_DIR = path.join(__dirname, '../cloudinary_backup');

const downloadImage = (url: string, dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Ensure directory exists
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const downloadAllImages = async () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR);
    }

    let nextCursor = undefined;
    let count = 0;

    console.log('Starting Cloudinary image download...');

    do {
      const result: any = await cloudinary.api.resources({
        type: 'upload',
        max_results: 500,
        next_cursor: nextCursor,
      });

      const resources = result.resources;
      
      for (const res of resources) {
        const ext = res.format ? `.${res.format}` : '';
        const destPath = path.join(BACKUP_DIR, `${res.public_id}${ext}`);
        
        console.log(`Downloading: ${res.public_id}...`);
        await downloadImage(res.secure_url, destPath);
        count++;
      }

      nextCursor = result.next_cursor;
    } while (nextCursor);

    console.log(`Successfully downloaded ${count} images to ${BACKUP_DIR}`);
  } catch (error) {
    console.error('Error downloading images:', error);
  }
};

downloadAllImages();
