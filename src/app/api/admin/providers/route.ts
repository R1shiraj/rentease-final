// src/app/api/admin/providers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Get pagination params
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const verified = searchParams.get('verified');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        // Build query
        const query: any = { role: 'PROVIDER' };

        if (verified === 'true') {
            query.isVerified = true;
        } else if (verified === 'false') {
            query.isVerified = false;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { businessName: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query
        const totalProviders = await User.countDocuments(query);
        const providers = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            providers,
            pagination: {
                total: totalProviders,
                page,
                limit,
                pages: Math.ceil(totalProviders / limit)
            }
        });
    } catch (error: any) {
        console.error('Error fetching providers:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch providers', details: error.message },
            { status: 500 }
        );
    }
}

// Verify provider
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        await dbConnect();
        const data = await req.json();
        const { providerId, isVerified } = data;

        if (!providerId) {
            return NextResponse.json(
                { error: 'Provider ID is required' },
                { status: 400 }
            );
        }

        if (typeof isVerified !== 'boolean') {
            return NextResponse.json(
                { error: 'isVerified field must be a boolean' },
                { status: 400 }
            );
        }

        const provider = await User.findById(providerId);

        if (!provider) {
            return NextResponse.json(
                { error: 'Provider not found' },
                { status: 404 }
            );
        }

        if (provider.role !== 'PROVIDER') {
            return NextResponse.json(
                { error: 'User is not a provider' },
                { status: 400 }
            );
        }

        const updatedProvider = await User.findByIdAndUpdate(
            providerId,
            { $set: { isVerified } },
            { new: true }
        ).select('-password');

        return NextResponse.json({ provider: updatedProvider });
    } catch (error: any) {
        console.error('Error verifying provider:', error.message);
        return NextResponse.json(
            { error: 'Failed to verify provider', details: error.message },
            { status: 500 }
        );
    }
}