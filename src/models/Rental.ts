// src/models/Rental.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRental extends Document {
    userId: string;
    applianceId: string;
    providerId: string;
    startDate: Date;
    endDate: Date;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    deposit: number;
    paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
    paymentMethod: 'CASH_ON_DELIVERY' | 'ONLINE';
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    deliveryTime: string;
    createdAt: Date;
    updatedAt: Date;
}

const RentalSchema = new Schema<IRental>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        applianceId: { type: Schema.Types.ObjectId, ref: 'Appliance', required: true },
        providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
            default: 'PENDING'
        },
        totalAmount: { type: Number, required: true },
        deposit: { type: Number, required: true },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PAID', 'REFUNDED'],
            default: 'PENDING'
        },
        paymentMethod: {
            type: String,
            enum: ['CASH_ON_DELIVERY', 'ONLINE'],
            default: 'CASH_ON_DELIVERY'
        },
        deliveryAddress: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true }
        },
        deliveryTime: { type: String, required: true },
        hasReview: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.models.Rental || mongoose.model<IRental>('Rental', RentalSchema);