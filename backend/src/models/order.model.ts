import { Schema, model, Types } from 'mongoose';

export interface IOrderItem {
  accessoryId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  orderNumber: string; // e.g. ORD-0001
  customerId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    accessoryId: { type: Schema.Types.ObjectId, ref: 'Accessory', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['Pending', 'Paid', 'Refunded'], 
      default: 'Pending' 
    },
    notes: { type: String }
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', orderSchema);
