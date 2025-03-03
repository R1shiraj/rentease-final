// src/app/api/appliances/brands/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Appliance from '@/models/Appliance';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Get unique brands from appliances collection
        const brands = await Appliance.distinct('specifications.brand');

        return NextResponse.json({
            success: true,
            brands
        });
    } catch (error) {
        console.error('Error fetching appliance brands:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}