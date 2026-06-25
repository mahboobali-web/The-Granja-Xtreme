import { Schema, model, Types } from 'mongoose';

export interface IDamageCheck {
  part: string; // e.g. Left Fender, Front Bumper, Rear Rack, Handlebars
  status: 'OK' | 'SCRATCHED' | 'DENTED' | 'BROKEN';
  notes?: string;
  photoUrl?: string;
}

export interface IInspectionLog {
  bookingId: Types.ObjectId;
  type: 'CHECK_OUT' | 'CHECK_IN';
  staffId: Types.ObjectId;
  staffName?: string;
  signatureData?: string;
  odometer: number;
  fuelLevel: number; // 0-100 percentage
  damages: IDamageCheck[];
  loggedAt: Date;
}

const damageCheckSchema = new Schema<IDamageCheck>({
  part: { type: String, required: true },
  status: {
    type: String,
    enum: ['OK', 'SCRATCHED', 'DENTED', 'BROKEN'],
    default: 'OK'
  },
  notes: { type: String },
  photoUrl: { type: String }
});

const inspectionLogSchema = new Schema<IInspectionLog>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    type: {
      type: String,
      enum: ['CHECK_OUT', 'CHECK_IN'],
      required: true
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    staffName: {
      type: String
    },
    signatureData: {
      type: String
    },
    odometer: {
      type: Number,
      required: true
    },
    fuelLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    damages: [damageCheckSchema],
    loggedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const InspectionLog = model<IInspectionLog>('InspectionLog', inspectionLogSchema);
