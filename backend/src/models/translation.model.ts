import mongoose, { Schema, Document } from 'mongoose';

export interface ITranslation extends Document {
  key: string;
  en: string;
  es: string;
  source: 'ui' | 'dynamic';
}

const translationSchema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  en: { type: String, required: true },
  es: { type: String, required: true },
  source: { type: String, enum: ['ui', 'dynamic'], default: 'ui' }
}, { timestamps: true });

export const Translation = mongoose.model<ITranslation>('Translation', translationSchema);
