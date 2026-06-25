import { Schema, model, Types } from 'mongoose';

export interface IMaintenance {
  atvId: Types.ObjectId;
  description: string;
  mechanicName: string;
  estimatedCost: number;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  scheduledDate: Date;
}

const maintenanceSchema = new Schema<IMaintenance>(
  {
    atvId: { type: Schema.Types.ObjectId, ref: 'Atv', required: true },
    description: { type: String, required: true },
    mechanicName: { type: String, required: true },
    estimatedCost: { type: Number, required: true },
    status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed'], default: 'Scheduled' },
    scheduledDate: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Maintenance = model<IMaintenance>('Maintenance', maintenanceSchema);
