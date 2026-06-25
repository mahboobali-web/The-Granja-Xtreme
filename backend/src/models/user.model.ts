import { Schema, model } from 'mongoose';

export interface IUser {
  email: string;
  firebaseUid?: string;
  passwordHash?: string;
  firstName: string;
  lastName: string;
  phone: string;
  passport?: string;
  position?: string;
  role: 'customer' | 'staff' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true
    },
    passwordHash: {
      type: String
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    passport: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['customer', 'staff', 'admin'],
      default: 'customer'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  {
    timestamps: true
  }
);

// Exclude password hash from standard JSON queries
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const r = ret as any;
    delete r.passwordHash;
    delete r.__v;
    return r;
  }
});

export const User = model<IUser>('User', userSchema);
