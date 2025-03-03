// src/app/api/user/rentals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Rental from '@/models/Rental';
import Appliance from '@/models/Appliance';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();

        await connectToDatabase();

        // 1. Get the appliance details to find the provider
        const appliance = await Appliance.findById(body.applianceId);

        if (!appliance) {
            return NextResponse.json(
                { success: false, error: 'Appliance not found' },
                { status: 404 }
            );
        }

        // 2. Check if appliance is available
        if (appliance.status !== 'AVAILABLE') {
            return NextResponse.json(
                { success: false, error: 'Appliance is not available for rent' },
                { status: 400 }
            );
        }

        // 3. Create the rental with the correct providerId
        const newRental = new Rental({
            ...body,
            userId: session.user.id,
            providerId: appliance.providerId, // Set the provider ID from the appliance
            status: 'PENDING',
            paymentStatus: body.paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING'
        });

        // 4. Start a database transaction to ensure consistency
        const session_db = await mongoose.startSession();
        session_db.startTransaction();

        try {
            // Save the rental
            await newRental.save({ session: session_db });

            // Update the appliance status to RENTED
            appliance.status = 'RENTED';
            await appliance.save({ session: session_db });

            // Commit the transaction
            await session_db.commitTransaction();
        } catch (error) {
            // If anything fails, abort the transaction
            await session_db.abortTransaction();
            throw error;
        } finally {
            // End the session
            session_db.endSession();
        }

        return NextResponse.json({
            success: true,
            rental: newRental
        });
    } catch (error) {
        console.error('Error creating rental:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get user's rentals
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        // Get status filter from URL if provided
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        // Build query
        const query: any = { userId: session.user.id };
        if (status) {
            // Handle comma-separated status values
            const statusValues = status.split(',');
            if (statusValues.length > 1) {
                query.status = { $in: statusValues };
            } else {
                query.status = status;
            }
        }

        // Fetch rentals with populated appliance and provider details
        const rentals = await Rental.find(query)
            .populate('applianceId', 'name images pricing status')
            .populate('providerId', 'name businessName phone')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            rentals
        });
    } catch (error) {
        console.error('Error fetching rentals:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}