// src/app/api/appliances/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Appliance from '@/models/Appliance';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const applianceId = params.id;

        const appliance = await Appliance.findById(applianceId).populate({
            path: 'providerId',
            select: 'name businessName isVerified rating'
        });

        if (!appliance) {
            return NextResponse.json(
                { success: false, error: 'Appliance not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            appliance
        });
    } catch (error) {
        console.error('Error fetching appliance:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}