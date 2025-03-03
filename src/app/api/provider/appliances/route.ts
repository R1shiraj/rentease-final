// src/app/api/provider/appliances/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Appliance from "@/models/Appliance";
import connectToDatabase from "@/lib/mongodb";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            );
        }

        await connectToDatabase();
        const appliances = await Appliance.find({ providerId: session.user.id });

        return NextResponse.json(appliances);
    } catch (error) {
        console.error("Error fetching appliances:", error);
        return NextResponse.json(
            { error: "Failed to fetch appliances" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            );
        }

        const data = await req.json();
        await connectToDatabase();

        const newAppliance = new Appliance({
            ...data,
            providerId: session.user.id,
        });

        await newAppliance.save();

        return NextResponse.json(newAppliance, { status: 201 });
    } catch (error) {
        console.error("Error creating appliance:", error);
        return NextResponse.json(
            { error: "Failed to create appliance" },
            { status: 500 }
        );
    }
}