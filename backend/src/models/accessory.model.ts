import { Schema, model } from 'mongoose';

export interface IAccessory {
  name: string;
  nameEs?: string;
  description: string;
  descriptionEs?: string;
  price: number;
  quantity?: number;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const accessorySchema = new Schema<IAccessory>(
  {
    name: { type: String, required: true },
    nameEs: { type: String },
    description: { type: String, required: true },
    descriptionEs: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number }, // Optional quantity for tracking
    images: [{ type: String }]
  },
  { timestamps: true }
);

export const Accessory = model<IAccessory>('Accessory', accessorySchema);
