import { Schema, model, Types } from 'mongoose';

export interface IPayment {
  receiptNumber: string;
  invoiceId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  customerId: Types.ObjectId;
  amount: number;
  paymentMethod: 'PayPal' | 'International Card' | 'Banco Popular' | 'Banreservas' | 'Zelle' | 'Cash' | 'Apple Pay' | 'Google Pay' | 'Refund';
  currency?: 'USD' | 'DOP';
  originalAmount?: number;
  exchangeRate?: number;
  tenderedAmount?: number;
  changeGiven?: number;
  collectedBy: Types.ObjectId;
  collectionDate: Date;
  status: 'Pending' | 'Paid' | 'Cancelled' | 'Refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: false },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { 
      type: String, 
      enum: ['PayPal', 'International Card', 'Banco Popular', 'Banreservas', 'Zelle', 'Cash', 'Apple Pay', 'Google Pay', 'Refund'], 
      required: true 
    },
    currency: { type: String, enum: ['USD', 'DOP'], default: 'USD' },
    originalAmount: { type: Number },
    exchangeRate: { type: Number, default: 58.80 },
    tenderedAmount: { type: Number },
    changeGiven: { type: Number },
    collectedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collectionDate: { type: Date, required: true, default: Date.now },
    status: { 
      type: String, 
      enum: ['Pending', 'Paid', 'Cancelled', 'Refunded'], 
      default: 'Paid' 
    },
    notes: { type: String }
  },
  { timestamps: true }
);

export const Payment = model<IPayment>('Payment', paymentSchema);
