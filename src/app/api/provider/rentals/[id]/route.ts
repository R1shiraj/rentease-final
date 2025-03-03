// src/app/api/provider/rentals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Rental from '@/models/Rental';
import Appliance from '@/models/Appliance';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'PROVIDER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        const rentalId = params.id;

        await connectDB();

        const rental = await Rental.findOne({
            _id: rentalId,
            providerId
        })
            .populate('applianceId', 'name images specifications pricing')
            .populate('userId', 'name email phone address');

        if (!rental) {
            return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
        }

        return NextResponse.json({ rental }, { status: 200 });
    } catch (error) {
        console.error('Error fetching rental:', error);
        return NextResponse.json({ error: 'Failed to fetch rental' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'PROVIDER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        const rentalId = params.id;
        const { status } = await req.json();

        await connectDB();

        const rental = await Rental.findOne({
            _id: rentalId,
            providerId
        });

        if (!rental) {
            return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
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

        return NextResponse.json({ rental }, { status: 200 });
    } catch (error) {
        console.error('Error updating rental:', error);
        return NextResponse.json({ error: 'Failed to update rental' }, { status: 500 });
    }
}