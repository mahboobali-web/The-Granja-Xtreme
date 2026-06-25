import { Schema, model } from 'mongoose';

export interface ICounter {
  _id: string; // The sequence name, e.g. 'booking', 'invoice'
  sequence_value: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

export const Counter = model<ICounter>('Counter', counterSchema);
