// src/app/api/user/cart/[itemId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { itemId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { itemId } = params;

        if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid item ID' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $pull: { cart: { _id: itemId } } },
            { new: true }
        ).populate({
            path: 'cart.applianceId',
            select: 'name images pricing'
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Item removed from cart',
            cart: user.cart
        });
    } catch (error) {
        console.error('Error removing from cart:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}