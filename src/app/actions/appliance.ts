// src/app/actions/appliance.ts
"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Appliance from "@/models/Appliance";
import connectToDatabase from "@/lib/mongodb";
import { redirect } from "next/navigation";

interface ApplianceFormData {
    name: string;
    description: string;
    category: string;
    images: string[];
    specifications: {
        brand: string;
        model: string;
        year: number;
        [key: string]: any;
    };
    pricing: {
        daily: number;
        weekly: number;
        monthly: number;
        deposit: number;
    };
    status: "AVAILABLE" | "RENTED" | "MAINTENANCE";
}

export async function createAppliance(formData: ApplianceFormData) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            throw new Error("Unauthorized access");
        }

        await connectToDatabase();

        const newAppliance = new Appliance({
            ...formData,
            providerId: session.user.id,
        });

        await newAppliance.save();

        revalidatePath("/provider/appliances");
        return { success: true, data: JSON.parse(JSON.stringify(newAppliance)) };
    } catch (error: any) {
        console.error("Error creating appliance:", error);
        return { success: false, error: error.message };
    }
}

export async function updateAppliance(id: string, formData: Partial<ApplianceFormData>) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            throw new Error("Unauthorized access");
        }

        await connectToDatabase();

        // Find the appliance and check ownership
        const appliance = await Appliance.findById(id);

        if (!appliance) {
            throw new Error("Appliance not found");
        }

        if (appliance.providerId.toString() !== session.user.id) {
            throw new Error("Unauthorized access to this appliance");
        }

        // Update the appliance
        const updatedAppliance = await Appliance.findByIdAndUpdate(
            id,
            { ...formData },
            { new: true, runValidators: true }
        );

        revalidatePath("/provider/appliances");
        revalidatePath(`/provider/appliances/${id}`);
        return { success: true, data: JSON.parse(JSON.stringify(updatedAppliance)) };
    } catch (error: any) {
        console.error("Error updating appliance:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAppliance(id: string) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            throw new Error("Unauthorized access");
        }

        await connectToDatabase();

        // Find the appliance and check ownership
        const appliance = await Appliance.findById(id);

        if (!appliance) {
            throw new Error("Appliance not found");
        }

        if (appliance.providerId.toString() !== session.user.id) {
            throw new Error("Unauthorized access to this appliance");
        }

        // Delete the appliance
        await Appliance.findByIdAndDelete(id);

        revalidatePath("/provider/appliances");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting appliance:", error);
        return { success: false, error: error.message };
    }
}

export async function getProviderAppliances() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            throw new Error("Unauthorized access");
        }

        await connectToDatabase();
        const appliances = await Appliance.find({ providerId: session.user.id });

        return { success: true, data: JSON.parse(JSON.stringify(appliances)) };
    } catch (error: any) {
        console.error("Error fetching appliances:", error);
        return { success: false, error: error.message };
    }
}

export async function getApplianceById(id: string) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            throw new Error("Unauthorized access");
        }

        await connectToDatabase();
        const appliance = await Appliance.findById(id);

        if (!appliance) {
            throw new Error("Appliance not found");
        }

        if (appliance.providerId.toString() !== session.user.id) {
            throw new Error("Unauthorized access to this appliance");
        }

        return { success: true, data: JSON.parse(JSON.stringify(appliance)) };
    } catch (error: any) {
        console.error("Error fetching appliance:", error);
        return { success: false, error: error.message };
    }
}