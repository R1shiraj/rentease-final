// src/app/api/appliances/popular/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Appliance from '@/models/Appliance';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get popular appliances
        // Logic: Fetching appliances with highest review counts and 'AVAILABLE' status
        const popularAppliances = await Appliance.find({ status: 'AVAILABLE' })
            .sort({ reviewCount: -1, ratings: -1 })
            .limit(8)
            .populate({
                path: 'providerId',
                select: 'name businessName isVerified rating'
            });

        return NextResponse.json({
            success: true,
            appliances: popularAppliances
        });
    } catch (error) {
        console.error('Error fetching popular appliances:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}