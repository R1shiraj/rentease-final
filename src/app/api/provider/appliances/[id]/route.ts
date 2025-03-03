// src/app/api/provider/appliances/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Appliance from "@/models/Appliance";
import connectToDatabase from "@/lib/mongodb";

// Get a single appliance
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            );
        }

        await connectToDatabase();
        const appliance = await Appliance.findById(params.id);

        if (!appliance) {
            return NextResponse.json(
                { error: "Appliance not found" },
                { status: 404 }
            );
        }

        // Check if the appliance belongs to the provider
        if (appliance.providerId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized access to this appliance" },
                { status: 403 }
            );
        }

        return NextResponse.json(appliance);
    } catch (error) {
        console.error("Error fetching appliance:", error);
        return NextResponse.json(
            { error: "Failed to fetch appliance" },
            { status: 500 }
        );
    }
}

// Update an appliance
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Find the appliance and check ownership
        const appliance = await Appliance.findById(params.id);

        if (!appliance) {
            return NextResponse.json(
                { error: "Appliance not found" },
                { status: 404 }
            );
        }

        if (appliance.providerId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized access to this appliance" },
                { status: 403 }
            );
        }

        // Update the appliance
        const updatedAppliance = await Appliance.findByIdAndUpdate(
            params.id,
            { ...data },
            { new: true, runValidators: true }
        );

        return NextResponse.json(updatedAppliance);
    } catch (error) {
        console.error("Error updating appliance:", error);
        return NextResponse.json(
            { error: "Failed to update appliance" },
            { status: 500 }
        );
    }
}

// Delete an appliance
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        // Find the appliance and check ownership
        const appliance = await Appliance.findById(params.id);

        if (!appliance) {
            return NextResponse.json(
                { error: "Appliance not found" },
                { status: 404 }
            );
        }

        if (appliance.providerId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized access to this appliance" },
                { status: 403 }
            );
        }

        // Delete the appliance
        await Appliance.findByIdAndDelete(params.id);

        return NextResponse.json(
            { message: "Appliance deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting appliance:", error);
        return NextResponse.json(
            { error: "Failed to delete appliance" },
            { status: 500 }
        );
    }
}