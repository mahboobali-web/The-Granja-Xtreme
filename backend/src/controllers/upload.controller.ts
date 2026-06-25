import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { logActivity } from './logs.controller';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, folder } = req.body; // image should be a base64 string

    if (!image) {
      res.status(400).json({ message: 'No image data provided.' });
      return;
    }

    const uploadOptions: any = {
      folder: folder ? `granjaxtreme/${folder}` : 'granjaxtreme/general',
    };

    const uploadResult = await cloudinary.uploader.upload(image, uploadOptions);

    await logActivity(`Uploaded image to Cloudinary (${uploadResult.public_id})`, (req as any).user?.email || 'admin', req.ip || '', 'info');

    res.status(200).json({ 
      url: uploadResult.secure_url, 
      public_id: uploadResult.public_id 
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload image.', error: (error as Error).message });
  }
};
