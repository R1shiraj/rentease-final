// src/app/api/appliances/[id]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const applianceId = params.id;

        const reviews = await Review.find({ applianceId })
            .populate({
                path: 'userId',
                select: 'name'
            })
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}