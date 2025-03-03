// src/app/api/appliances/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Appliance from '@/models/Appliance';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const url = new URL(req.url);
        const category = url.searchParams.get('category');
        const search = url.searchParams.get('search');
        const minPrice = url.searchParams.get('priceMin');
        const maxPrice = url.searchParams.get('priceMax');
        const brands = url.searchParams.get('brands');

        // Build query
        const query: any = { status: 'AVAILABLE' };

        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query['pricing.daily'] = {};
            if (minPrice) query['pricing.daily'].$gte = parseInt(minPrice);
            if (maxPrice) query['pricing.daily'].$lte = parseInt(maxPrice);
        }

        if (brands) {
            const brandList = brands.split(',');
            query['specifications.brand'] = { $in: brandList };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'specifications.brand': { $regex: search, $options: 'i' } }
            ];
        }

        const appliances = await Appliance.find(query)
            .populate({
                path: 'providerId',
                select: 'name businessName isVerified rating'
            });

        return NextResponse.json({
            success: true,
            appliances
        });
    } catch (error) {
        console.error('Error fetching appliances:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}