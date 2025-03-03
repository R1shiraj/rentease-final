// src/app/api/appliances/featured/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Appliance from '@/models/Appliance';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get featured appliances
        // Logic: Fetching appliances with highest ratings and 'AVAILABLE' status
        const featuredAppliances = await Appliance.find({ status: 'AVAILABLE' })
            .sort({ ratings: -1, reviewCount: -1 })
            .limit(5)
            .populate({
                path: 'providerId',
                select: 'name businessName isVerified rating'
            });

        return NextResponse.json({
            success: true,
            appliances: featuredAppliances
        });
    } catch (error) {
        console.error('Error fetching featured appliances:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}