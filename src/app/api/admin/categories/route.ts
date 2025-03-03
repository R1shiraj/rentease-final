// src/app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const activeOnly = searchParams.get('activeOnly') === 'true';

        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (activeOnly) {
            query.isActive = true;
        }

        // Execute query
        const totalCategories = await Category.countDocuments(query);
        const categories = await Category.find(query)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({
            categories,
            pagination: {
                total: totalCategories,
                page,
                limit,
                pages: Math.ceil(totalCategories / limit)
            }
        });
    } catch (error: any) {
        console.error('Error fetching categories:', error.message);
        return NextResponse.json(
            { error: 'Failed to fetch categories', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
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

        // Validate required fields
        const { name, description, image } = data;
        if (!name || !description || !image) {
            return NextResponse.json(
                { error: 'Name, description, and image are required' },
                { status: 400 }
            );
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 409 }
            );
        }

        // Create new category
        const newCategory = await Category.create(data);

        return NextResponse.json({ category: newCategory }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating category:', error.message);
        return NextResponse.json(
            { error: 'Failed to create category', details: error.message },
            { status: 500 }
        );
    }
}