// src/app/api/user/rentals/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Rental from '@/models/Rental';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
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

        const rental = await Rental.findOne({
            _id: params.id,
            userId: session.user.id
        }).populate({
            path: 'applianceId',
            select: 'name images specifications'
        });

        if (!rental) {
            return NextResponse.json(
                { success: false, error: 'Rental not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            rental
        });
    } catch (error) {
        console.error('Error fetching rental:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}