// src/app/api/payment/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-08-16',
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'You must be logged in to create a payment' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { amount, metadata, currency = 'inr', isInternational = false } = body;

        await connectToDatabase();

        // Get the current user details from the database
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Parse the delivery address from metadata if it exists
        const deliveryAddress = metadata.deliveryAddress ? JSON.parse(metadata.deliveryAddress) : null;

        // Use user's address or delivery address
        const address = deliveryAddress || user.address;

        // Determine if this is an international transaction
        const countryCode = isInternational ? (metadata.countryCode || 'US') : 'IN';

        // Set up payment intent options
        const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
            amount: Math.round(amount * 100), // Stripe expects amounts in cents
            currency: isInternational ? (currency || 'usd') : 'inr',
            description: 'Home appliance rental', // Add a description for the transaction
            automatic_payment_methods: {
                enabled: true,
            },
        };

        // Add customer details based on whether it's domestic or international
        if (isInternational) {
            // For international transactions, we need to provide export details
            paymentIntentOptions.shipping = {
                name: user.name,
                address: {
                    line1: address.street,
                    city: address.city,
                    state: address.state,
                    postal_code: address.zipCode,
                    country: countryCode, // International country code
                },
            };

            // Create a customer for billing details
            const customer = await stripe.customers.create({
                name: user.name,
                email: user.email,
                address: {
                    line1: address.street,
                    city: address.city,
                    state: address.state,
                    postal_code: address.zipCode,
                    country: countryCode,
                },
            });

            // Attach customer ID to the payment intent
            paymentIntentOptions.customer = customer.id;

            // Add metadata for Stripe's India export requirements
            paymentIntentOptions.metadata = {
                ...metadata,
                exportTransaction: 'true',
                transactionPurposeCode: 'P0802', // Example: Common transaction code for rentals/leasing
            };
        } else {
            // For domestic transactions
            paymentIntentOptions.shipping = {
                name: user.name,
                address: {
                    line1: address.street,
                    city: address.city,
                    state: address.state,
                    postal_code: address.zipCode,
                    country: 'IN',
                },
            };

            // Add basic customer details
            paymentIntentOptions.metadata = metadata || {};
        }

        // Create the payment intent
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            isInternational,
        });
    } catch (error: any) {
        console.error('Payment error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}