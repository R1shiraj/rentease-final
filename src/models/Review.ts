// src/models/Review.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    userId: string;
    applianceId: string;
    providerId: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        applianceId: { type: Schema.Types.ObjectId, ref: 'Appliance', required: true },
        providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: { type: String, required: true }
    },
    { timestamps: true }
);

// Create a compound index to ensure one review per user per appliance
ReviewSchema.index({ userId: 1, applianceId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);