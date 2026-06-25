import { Schema, model, Types } from 'mongoose';

export interface IWaiver {
  contractNumber: string;
  bookingId: Types.ObjectId;
  customerName: string;
  agreedToTerms: boolean;
  ipAddress: string;
  signedAt: Date;
  termsVersion: string;
  documentUrl?: string;
}

const waiverSchema = new Schema<IWaiver>(
  {
    contractNumber: {
      type: String,
      required: true,
      unique: true
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    agreedToTerms: {
      type: Boolean,
      required: true
    },
    ipAddress: {
      type: String,
      required: true
    },
    signedAt: {
      type: Date,
      default: Date.now
    },
    termsVersion: {
      type: String,
      required: true,
      default: 'v1.0'
    },
    documentUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export const Waiver = model<IWaiver>('Waiver', waiverSchema);
