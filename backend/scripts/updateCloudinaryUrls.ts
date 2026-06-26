import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Atv } from '../src/models/atv.model';
import { User } from '../src/models/user.model';
import { Booking } from '../src/models/booking.model';
import { InspectionLog } from '../src/models/inspection.model';
import { Waiver } from '../src/models/waiver.model';
import { CmsContent } from '../src/models/cms.model';

dotenv.config({ path: path.join(__dirname, '../.env') });

const OLD_CLOUD_NAME = 'dem61nx9x';
const NEW_CLOUD_NAME = 'duwdcnlzp';

const replaceUrl = (url: string | undefined | null) => {
  if (!url) return url;
  if (url.includes(`res.cloudinary.com/${OLD_CLOUD_NAME}`)) {
    return url.replace(`res.cloudinary.com/${OLD_CLOUD_NAME}`, `res.cloudinary.com/${NEW_CLOUD_NAME}`);
  }
  return url;
};

const updateDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB for Cloudinary URL update');

    let updatedCount = 0;

    // 1. ATVs
    const atvs = await Atv.find();
    for (const atv of atvs) {
      let changed = false;
      const newImages = atv.images.map(img => {
        const newImg = replaceUrl(img);
        if (newImg !== img) changed = true;
        return newImg || '';
      });
      if (changed) {
        atv.images = newImages;
        await atv.save();
        updatedCount++;
      }
    }

    // 2. Users
    const users = await User.find();
    for (const user of users as any[]) {
      const newPic = replaceUrl(user.profilePicture);
      if (newPic && newPic !== user.profilePicture) {
        user.profilePicture = newPic;
        await user.save();
        updatedCount++;
      }
    }

    // 3. Bookings
    const bookings = await Booking.find();
    for (const booking of bookings as any[]) {
      let changed = false;
      const newCustSig = replaceUrl(booking.customerSignature);
      if (newCustSig && newCustSig !== booking.customerSignature) {
        booking.customerSignature = newCustSig;
        changed = true;
      }
      const newAdminSig = replaceUrl(booking.adminSignature);
      if (newAdminSig && newAdminSig !== booking.adminSignature) {
        booking.adminSignature = newAdminSig;
        changed = true;
      }
      if (changed) {
        await booking.save();
        updatedCount++;
      }
    }

    // 4. Waivers
    const waivers = await Waiver.find();
    for (const waiver of waivers as any[]) {
      let changed = false;
      
      // Some dynamic fields may contain signatures
      if (waiver.signatures) {
        for (const sig of waiver.signatures) {
          const newSigUrl = replaceUrl(sig.signatureUrl);
          if (newSigUrl && newSigUrl !== sig.signatureUrl) {
            sig.signatureUrl = newSigUrl;
            changed = true;
          }
        }
      }

      const newCustSig = replaceUrl(waiver.customerSignature);
      if (newCustSig && newCustSig !== waiver.customerSignature) {
        waiver.customerSignature = newCustSig;
        changed = true;
      }
      
      const newGuardSig = replaceUrl(waiver.guardianSignature);
      if (newGuardSig && newGuardSig !== waiver.guardianSignature) {
        waiver.guardianSignature = newGuardSig;
        changed = true;
      }

      if (changed) {
        await waiver.save();
        updatedCount++;
      }
    }

    // 5. Inspection Logs
    const logs = await InspectionLog.find();
    for (const log of logs as any[]) {
      let changed = false;
      const newPhoto = replaceUrl(log.photoUrl);
      if (newPhoto && newPhoto !== log.photoUrl) {
        log.photoUrl = newPhoto;
        changed = true;
      }
      if (log.items) {
        for (const item of log.items) {
          const newItemPhoto = replaceUrl(item.photoUrl);
          if (newItemPhoto && newItemPhoto !== item.photoUrl) {
            item.photoUrl = newItemPhoto;
            changed = true;
          }
        }
      }
      if (changed) {
        await log.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated URLs in ${updatedCount} documents.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating URLs in DB:', error);
    process.exit(1);
  }
};

updateDatabase();
