import { Schema, model, Types } from 'mongoose';

export interface ICmsContent {
  key: string; // unique key describing the content section (e.g. 'homepage_hero', 'rental_rates_rules')
  value: Record<string, any>; // free-form JSON object containing the fields
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cmsContentSchema = new Schema<ICmsContent>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: Schema.Types.Mixed,
      required: true
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const CmsContent = model<ICmsContent>('CmsContent', cmsContentSchema);
