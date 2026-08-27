import { Schema, model, Types } from 'mongoose';

export interface IInvoice {
  invoiceNumber: string; // e.g. TGX-0001
  bookingId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  customerId: Types.ObjectId;
  atvId?: Types.ObjectId;
  invoiceType: 'Rental Charge' | 'Damage Charge' | 'Extra Charge';
  description: string;
  amount: number;
  discountRate?: number;
  discountAmount?: number;
  balance: number;
  status: 'Draft' | 'Unpaid' | 'Partially Paid' | 'Paid' | 'Void';
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: false },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    atvId: { type: Schema.Types.ObjectId, ref: 'Atv', required: false },
    invoiceType: { 
      type: String, 
      enum: ['Rental Charge', 'Damage Charge', 'Extra Charge'], 
      required: true 
    },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    discountRate: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
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
