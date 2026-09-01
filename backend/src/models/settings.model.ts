import { Schema, model } from 'mongoose';

export interface ISettings {
  baseTaxRate: number;
  securityDeposit: number;
  defaultDiscountRate: number;
  operatingHours: {
    days: string;
    open: string;
    close: string;
  };
  currency: string;
  exchangeRateDOP: number;
  businessEmail: string;
  businessPhone: string;
  cancellationPolicy: string;
  notifications: {
    newOrder: boolean;
    newMessage: boolean;
  };
  sessionTimeoutMinutes: number;
}

const settingsSchema = new Schema<ISettings>(
  {
    baseTaxRate: { type: Number, default: 8.5 },
    securityDeposit: { type: Number, default: 500 },
    defaultDiscountRate: { type: Number, default: 0 },
    operatingHours: {
      days: { type: String, default: 'Monday to Sunday' },
      open: { type: String, default: '08:00' },
      close: { type: String, default: '18:00' }
    },
    currency: { type: String, default: 'USD' },
    exchangeRateDOP: { type: Number, default: 58.80 },
    businessEmail: { type: String, default: 'hello@granjax.com' },
    businessPhone: { type: String, default: '+1 (555) 0123-4567' },
    cancellationPolicy: { type: String, default: 'Full refund 48 hours prior. No refund within 24 hours.' },
    notifications: {
      newOrder: { type: Boolean, default: true },
      newMessage: { type: Boolean, default: true }
    },
    sessionTimeoutMinutes: { type: Number, default: 30 }
  },
  { timestamps: true }
);

export const Settings = model<ISettings>('Settings', settingsSchema);
