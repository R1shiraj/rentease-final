// src/app/api/admin/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();
        const data = await req.json();

        // Check if name is being updated and if it already exists
        if (data.name) {
            const existingCategory = await Category.findOne({
                name: data.name,
                _id: { $ne: id }
            });

            if (existingCategory) {
                return NextResponse.json(
                    { error: 'Category with this name already exists' },
                    { status: 409 }
                );
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );

        if (!updatedCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ category: updatedCategory });
    } catch (error: any) {
        console.error('Error updating category:', error.message);
        return NextResponse.json(
            { error: 'Failed to update category', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized access' },
                { status: 401 }
            );
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Instead of deleting, just mark as inactive
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );

        if (!updatedCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Category deactivated successfully',
            category: updatedCategory
        });
    } catch (error: any) {
        console.error('Error deactivating category:', error.message);
        return NextResponse.json(
            { error: 'Failed to deactivate category', details: error.message },
            { status: 500 }
        );
    }
}