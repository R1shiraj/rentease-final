// src/app/api/provider/rentals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Rental from '@/models/Rental';
import Appliance from '@/models/Appliance';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'PROVIDER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const providerId = session.user.id;
        const status = req.nextUrl.searchParams.get('status');

        await connectToDatabase();

        const query: any = { providerId };
        if (status) {
            query.status = status;
        }

        const rentals = await Rental.find(query)
            .populate('applianceId', 'name images pricing')
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 });

        return NextResponse.json({ rentals }, { status: 200 });
    } catch (error) {
        console.error('Error fetching rentals:', error);
        return NextResponse.json({ error: 'Failed to fetch rentals' }, { status: 500 });
    }
}