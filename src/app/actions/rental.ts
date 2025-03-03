// src/app/actions/rental.ts
'use server'

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Rental from '@/models/Rental';
import Appliance from '@/models/Appliance';
import { revalidatePath } from 'next/cache';

export async function getProviderRentals(status?: string) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'PROVIDER') {
            throw new Error('Unauthorized');
        }

        const providerId = session.user.id;

        await connectToDatabase();

        const query: any = { providerId };
        if (status) {
            query.status = status;
        }

        const rentals = await Rental.find(query)
            .populate('applianceId', 'name images pricing')
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        return { rentals: JSON.parse(JSON.stringify(rentals)) };
    } catch (error) {
        console.error('Error fetching rentals:', error);
        return { error: 'Failed to fetch rentals' };
    }
}

export async function getProviderRental(rentalId: string) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'PROVIDER') {
            throw new Error('Unauthorized');
        }

        const providerId = session.user.id;

        await connectToDatabase();

        const rental = await Rental.findOne({
            _id: rentalId,
            providerId
        })
            .populate('applianceId', 'name images specifications pricing')
            .populate('userId', 'name email phone address');

        if (!rental) {
            throw new Error('Rental not found');
        }

        return { rental: JSON.parse(JSON.stringify(rental)) };
    } catch (error) {
        console.error('Error fetching rental:', error);
        return { error: 'Failed to fetch rental' };
    }
}

export async function updateRentalStatus(rentalId: string, status: string) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'PROVIDER') {
            throw new Error('Unauthorized');
        }

        const providerId = session.user.id;

        await connectToDatabase();

        const rental = await Rental.findOne({
            _id: rentalId,
            providerId
        });

        if (!rental) {
            throw new Error('Rental not found');
        }

        // Update rental status
        rental.status = status;
        await rental.save();

        // If status is APPROVED, update appliance status to RENTED
        if (status === 'APPROVED') {
            await Appliance.findByIdAndUpdate(rental.applianceId, {
                status: 'RENTED'
            });
        }

        // If status is COMPLETED, update appliance status back to AVAILABLE
        if (status === 'COMPLETED') {
            await Appliance.findByIdAndUpdate(rental.applianceId, {
                status: 'AVAILABLE'
            });
        }

        // If status is COMPLETED, update appliance status back to AVAILABLE
        if (status === 'REJECTED') {
            await Appliance.findByIdAndUpdate(rental.applianceId, {
                status: 'AVAILABLE'
            });
        }

        revalidatePath('/provider/rentals');
        revalidatePath(`/provider/rentals/${rentalId}`);

        return { success: true, message: `Rental ${status.toLowerCase()} successfully` };
    } catch (error) {
        console.error('Error updating rental status:', error);
        return { error: 'Failed to update rental status' };
    }
}