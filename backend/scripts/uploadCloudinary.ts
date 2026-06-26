import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';

// NEW Cloudinary Credentials
cloudinary.config({
  cloud_name: 'duwdcnlzp',
  api_key: '433275914879571',
  api_secret: 'BNj_e6L17fmg4D4uJb_Hp6xmKNc',
});

const BACKUP_DIR = path.join(__dirname, '../cloudinary_backup');

const getFilesRecursively = (dir: string, fileList: string[] = []): string[] => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFilesRecursively(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
};

const uploadAllImages = async () => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.error('Backup directory not found. Please download images first.');
      return;
    }

    const files = getFilesRecursively(BACKUP_DIR);
    console.log(`Found ${files.length} images to upload.`);

    let count = 0;
    for (const filePath of files) {
      // Calculate public_id by removing BACKUP_DIR and file extension
      const relativePath = path.relative(BACKUP_DIR, filePath);
      const parsed = path.parse(relativePath);
      const publicId = path.join(parsed.dir, parsed.name).replace(/\\/g, '/');

      console.log(`Uploading: ${publicId}...`);
      
      await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        resource_type: 'auto',
        overwrite: true
      });
      
      count++;
    }

    console.log(`Successfully uploaded ${count} images to new Cloudinary account.`);
  } catch (error) {
    console.error('Error uploading images:', error);
  }
};

uploadAllImages();
