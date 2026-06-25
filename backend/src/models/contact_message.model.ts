import { Schema, model } from 'mongoose';

export interface IContactMessage {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['unread', 'read'], default: 'unread' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ContactMessage = model<IContactMessage>('ContactMessage', contactMessageSchema);
