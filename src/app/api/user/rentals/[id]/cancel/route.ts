// src/app/api/user/rentals/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Rental from '@/models/Rental';
import Appliance from '@/models/Appliance';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        // Start a database transaction
        const session_db = await mongoose.startSession();
        session_db.startTransaction();

        try {
            // Find the rental that belongs to the user
            const rental = await Rental.findOne({
                _id: params.id,
                userId: session.user.id
            }).session(session_db);

            if (!rental) {
                await session_db.abortTransaction();
                session_db.endSession();
                return NextResponse.json(
                    { success: false, error: 'Rental not found' },
                    { status: 404 }
                );
            }

            // Check if the rental can be cancelled
            if (rental.status == 'APPROVED' || rental.status == 'ACTIVE') {
                await session_db.abortTransaction();
                session_db.endSession();
                return NextResponse.json(
                    { success: false, error: 'This rental cannot be cancelled' },
                    { status: 400 }
                );
            }

            // Update the rental status
            rental.status = 'CANCELLED';

            // If payment was made, mark as refunded
            if (rental.paymentStatus === 'PAID') {
                rental.paymentStatus = 'REFUNDED';
            }

            await rental.save({ session: session_db });

            // Update the appliance status back to AVAILABLE
            const appliance = await Appliance.findById(rental.applianceId).session(session_db);

            if (appliance) {
                appliance.status = 'AVAILABLE';
                await appliance.save({ session: session_db });
            }

            // Commit the transaction
            await session_db.commitTransaction();
            session_db.endSession();

            return NextResponse.json({
                success: true,
                message: 'Rental cancelled successfully',
                rental
            });
        } catch (error) {
            // If anything fails, abort the transaction
            await session_db.abortTransaction();
            session_db.endSession();
            throw error;
        }
    } catch (error) {
        console.error('Error cancelling rental:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}