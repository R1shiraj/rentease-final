// src/models/Appliance.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAppliance extends Document {
    name: string;
    description: string;
    category: string;
    images: string[];
    providerId: string;
    specifications: {
        brand: string;
        model: string;
        year: number;
        [key: string]: any;
    };
    pricing: {
        daily: number;
        weekly: number;
        monthly: number;
        deposit: number;
    };
    status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
    ratings: number;
    reviewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ApplianceSchema = new Schema<IAppliance>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, required: true },
        images: [{ type: String }],
        providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        specifications: {
            brand: { type: String, required: true },
            model: { type: String, required: true },
            year: { type: Number, required: true },
        },
        pricing: {
            daily: { type: Number, required: true },
            weekly: { type: Number, required: true },
            monthly: { type: Number, required: true },
            deposit: { type: Number, required: true },
        },
        status: {
            type: String,
            enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE'],
            default: 'AVAILABLE'
        },
        ratings: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export default mongoose.models.Appliance || mongoose.model<IAppliance>('Appliance', ApplianceSchema);