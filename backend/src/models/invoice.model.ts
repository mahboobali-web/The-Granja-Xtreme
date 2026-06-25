import { Schema, model, Types } from 'mongoose';

export interface IInvoice {
  invoiceNumber: string; // e.g. TGX-0001
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  atvId: Types.ObjectId;
  invoiceType: 'Rental Charge' | 'Damage Charge' | 'Extra Charge';
  description: string;
  amount: number;
  balance: number;
  status: 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Void';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    atvId: { type: Schema.Types.ObjectId, ref: 'Atv', required: true },
    invoiceType: { 
      type: String, 
      enum: ['Rental Charge', 'Damage Charge', 'Extra Charge'], 
      required: true 
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['Draft', 'Unpaid', 'Partially Paid', 'Paid', 'Void'], 
      default: 'Unpaid' 
    },
    dueDate: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
