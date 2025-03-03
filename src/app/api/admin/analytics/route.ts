// src/app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Category from '@/models/Category';
import Appliance from '@/models/Appliance';
import Rental from '@/models/Rental';

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

        // Get counts
        const [
            totalUsers,
            totalProviders,
            verifiedProviders,
            totalAppliances,
            availableAppliances,
            totalCategories,
            activeCategories,
            totalRentals,
            activeRentals,
            completedRentals,
            cancelledRentals
        ] = await Promise.all([
            User.countDocuments({ role: 'USER' }),
            User.countDocuments({ role: 'PROVIDER' }),
            User.countDocuments({ role: 'PROVIDER', isVerified: true }),
            Appliance.countDocuments({}),
            Appliance.countDocuments({ status: 'AVAILABLE' }),
            Category.countDocuments({}),
            Category.countDocuments({ isActive: true }),
            Rental.countDocuments({}),
            Rental.countDocuments({ status: 'ACTIVE' }),
            Rental.countDocuments({ status: 'COMPLETED' }),
            Rental.countDocuments({ status: 'CANCELLED' })
        ]);

        // Get recent user registrations
        const recentUsers = await User.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt');

        // Get recent rentals
        const recentRentals = await Rental.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('userId applianceId startDate endDate status totalAmount');

        // Get popular categories
        const appliancesByCategory = await Appliance.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);

        // Enrich category data
        const popularCategories = await Promise.all(
            appliancesByCategory.map(async (item) => {
                const category = await Category.findById(item._id).select('name');
                return {
                    categoryId: item._id,
                    categoryName: category?.name || 'Unknown',
                    applianceCount: item.count
                };
            })
        );

        return NextResponse.json({
            counts: {
                users: {
                    total: totalUsers,
                    providers: {
                        total: totalProviders,
                        verified: verifiedProviders
                    }
                },
                appliances: {
                    total: totalAppliances,
                    available: availableAppliances
                },
                categories: {
                    total: totalCategories,
                    active: activeCategories
                },
                rentals: {
                    total: totalRentals,
                    active: activeRentals,
                    completed: completedRentals,
                    cancelled: cancelledRentals
                }
            },
            recentUsers,
            recentRentals,
            popularCategories
        });
    } catch (error: any) {
        console.error('Error fetching analytics:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch analytics', details: error.message },
            { status: 500 }
        );
    }
}