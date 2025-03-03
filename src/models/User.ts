// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import { providerFields } from './Provider';

export interface ICartItem {
    applianceId: mongoose.Types.ObjectId;
    addedAt: Date;
}

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    role: 'USER' | 'ADMIN' | 'PROVIDER';
    cart: ICartItem[];
    // Provider specific fields
    businessName?: string;
    businessAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    rating?: number;
    appliances?: string[];
    isVerified?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zipCode: { type: String }
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN', 'PROVIDER'],
            default: 'USER'
        },
        cart: [{
            applianceId: { type: Schema.Types.ObjectId, ref: 'Appliance', required: true },
            addedAt: { type: Date, default: Date.now }
        }],
        // Provider specific fields (optional for regular users)
        ...providerFields,
    },
    { timestamps: true }
);

// Delete mongoose.models.User to prevent OverwriteModelError
if (mongoose.models.User) {
    delete mongoose.models.User;
}

export default mongoose.model<IUser>('User', UserSchema);