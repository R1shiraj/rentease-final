// src/app/api/user/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const user = await User.findById(session.user.id)
            .populate({
                path: 'cart.applianceId',
                select: 'name images pricing'
            })
            .select('cart');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Format the cart items for the frontend
        const cartItems = user.cart.map(item => ({
            id: item._id,
            applianceId: item.applianceId._id,
            appliance: item.applianceId,
            addedAt: item.addedAt
        }));

        return NextResponse.json({
            success: true,
            cartItems
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { applianceId } = await req.json();

        if (!applianceId) {
            return NextResponse.json(
                { success: false, error: 'Appliance ID is required' },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Check if the item is already in the cart
        const existingUser = await User.findById(session.user.id);
        const isItemInCart = existingUser?.cart.some(
            (item: any) => item.applianceId.toString() === applianceId
        );

        if (isItemInCart) {
            return NextResponse.json({
                success: true,
                message: 'Item already in cart',
                cart: existingUser?.cart
            });
        }

        // Add the item to the cart
        const user = await User.findByIdAndUpdate(
            session.user.id,
            {
                $push: {
                    cart: {
                        applianceId,
                        addedAt: new Date()
                    }
                }
            },
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
            cart: user.cart
        });
    } catch (error) {
        console.error('Error adding to cart:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { applianceId } = await req.json();

        await connectToDatabase();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $pull: { cart: { applianceId } } },
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