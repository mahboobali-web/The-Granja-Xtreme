import { Schema, model, Types } from 'mongoose';

export interface IReview {
  customerId: Types.ObjectId;
  bookingId?: Types.ObjectId;
  atvId?: Types.ObjectId;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    },
    atvId: {
      type: Schema.Types.ObjectId,
      ref: 'Atv'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', reviewSchema);
