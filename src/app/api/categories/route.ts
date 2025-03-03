import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
    try {
        await connectToDatabase();

        // Fetch only active categories
        const categories = await Category.find({ isActive: true });

        return NextResponse.json({
            success: true,
            categories,
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}