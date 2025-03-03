// src/app/api/provider/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import connectToDatabase from "@/lib/mongodb";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const provider = await User.findById(session.user.id).select("-password");

        if (!provider) {
            return NextResponse.json({ error: "Provider not found" }, { status: 404 });
        }

        return NextResponse.json(provider);
    } catch (error) {
        console.error("Error fetching provider profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch provider profile" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            );
        }

        const data = await request.json();
        await connectToDatabase();

        // Fields that can be updated
        const updatableFields = [
            "name",
            "phone",
            "address",
            "businessName",
            "businessAddress",
        ];

        // Create update object with only allowed fields
        const updateData: Record<string, any> = {};
        for (const field of updatableFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        const updatedProvider = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true }
        ).select("-password");

        if (!updatedProvider) {
            return NextResponse.json({ error: "Provider not found" }, { status: 404 });
        }

        return NextResponse.json(updatedProvider);
    } catch (error) {
        console.error("Error updating provider profile:", error);
        return NextResponse.json(
            { error: "Failed to update provider profile" },
            { status: 500 }
        );
    }
}