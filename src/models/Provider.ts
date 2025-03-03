// src/models/Provider.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface IProvider extends IUser {
    businessName: string;
    businessAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    rating: number;
    appliances: string[];
    isVerified: boolean;
}

// Define provider fields as a discriminator of User model
const providerFields = {
    businessName: {
        type: String,
        required: function (this: any) {
            return this.role === 'PROVIDER';
        }
    },
    businessAddress: {
        street: {
            type: String,
            required: function (this: any) {
                return this.role === 'PROVIDER';
            }
        },
        city: {
            type: String,
            required: function (this: any) {
                return this.role === 'PROVIDER';
            }
        },
        state: {
            type: String,
            required: function (this: any) {
                return this.role === 'PROVIDER';
            }
        },
        zipCode: {
            type: String,
            required: function (this: any) {
                return this.role === 'PROVIDER';
            }
        }
    },
    rating: { type: Number, default: 0 },
    appliances: [{ type: Schema.Types.ObjectId, ref: 'Appliance' }],
    isVerified: { type: Boolean, default: false }
};

export { providerFields };