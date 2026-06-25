import { Schema, model } from 'mongoose';

export interface IActivityLog {
  action: string;
  userEmail: string;
  ipAddress: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    userEmail: { type: String, required: true },
    ipAddress: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLog = model<IActivityLog>('ActivityLog', activityLogSchema);
