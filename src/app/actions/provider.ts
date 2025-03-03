// src/app/actions/provider.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Appliance from "@/models/Appliance";
import Rental from "@/models/Rental";
import Review from "@/models/Review";
import { revalidatePath } from "next/cache";

export type ProviderStats = {
    totalAppliances: number;
    activeRentals: number;
    completedRentals: number;
    totalEarnings: number;
    averageRating: number;
    pendingRentalRequests: number;
};

export async function getProviderProfile() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            throw new Error("Unauthorized access");
        }

        await connectToDatabase();

        const provider = await User.findById(session.user.id).select("-password");

        if (!provider) {
            throw new Error("Provider not found");
        }

        return JSON.parse(JSON.stringify(provider));
    } catch (error) {
        console.error("Error fetching provider profile:", error);
        throw new Error("Failed to fetch provider profile");
    }
}

export async function updateProviderProfile(data: {
    name?: string;
    phone?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
    };
    businessName?: string;
    businessAddress?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
    };
}) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            throw new Error("Unauthorized access");
        }

        await connectToDatabase();

        const updateData: Record<string, any> = {};

        if (data.name) updateData.name = data.name;
        if (data.phone) updateData.phone = data.phone;

        if (data.address) {
            updateData.address = {};
            if (data.address.street) updateData.address.street = data.address.street;
            if (data.address.city) updateData.address.city = data.address.city;
            if (data.address.state) updateData.address.state = data.address.state;
            if (data.address.zipCode) updateData.address.zipCode = data.address.zipCode;
        }

        if (data.businessName) updateData.businessName = data.businessName;

        if (data.businessAddress) {
            updateData.businessAddress = {};
            if (data.businessAddress.street) updateData.businessAddress.street = data.businessAddress.street;
            if (data.businessAddress.city) updateData.businessAddress.city = data.businessAddress.city;
            if (data.businessAddress.state) updateData.businessAddress.state = data.businessAddress.state;
            if (data.businessAddress.zipCode) updateData.businessAddress.zipCode = data.businessAddress.zipCode;
        }

        const updatedProvider = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateData },
            { new: true }
        ).select("-password");

        if (!updatedProvider) {
            throw new Error("Provider not found");
        }

        revalidatePath("/provider/profile");

        return updatedProvider;
    } catch (error) {
        console.error("Error updating provider profile:", error);
        throw error;
    }
}

export async function getProviderDashboardStats(): Promise<ProviderStats> {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            throw new Error("Unauthorized access");
        }

        await connectToDatabase();

        const providerId = session.user.id;

        // Get total appliances
        const totalAppliances = await Appliance.countDocuments({
            providerId,
        });

        // Get active rentals
        const activeRentals = await Rental.countDocuments({
            providerId,
            status: { $in: ["ACTIVE", "APPROVED"] },
        });

        // Get completed rentals
        const completedRentals = await Rental.countDocuments({
            providerId,
            status: "COMPLETED",
        });

        // Get pending rental requests
        const pendingRentalRequests = await Rental.countDocuments({
            providerId,
            status: "PENDING",
        });

        // Calculate total earnings from completed rentals
        const rentals = await Rental.find({
            providerId,
            status: "COMPLETED",
        });

        const totalEarnings = rentals.reduce(
            (sum, rental) => sum + rental.totalAmount,
            0
        );

        // Get average rating
        const provider = await User.findById(providerId);
        const averageRating = provider?.rating || 0;

        return {
            totalAppliances,
            activeRentals,
            completedRentals,
            totalEarnings,
            averageRating,
            pendingRentalRequests,
        };
    } catch (error) {
        console.error("Error fetching provider stats:", error);
        throw new Error("Failed to fetch provider dashboard statistics");
    }
}

export async function getRecentRentals(limit: number = 5) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "PROVIDER") {
            throw new Error("Unauthorized access");
        }

        await connectToDatabase();

        const recentRentals = await Rental.find({
            providerId: session.user.id,
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("applianceId", "name images")
            .populate("userId", "name email");

        return recentRentals;
    } catch (error) {
        console.error("Error fetching recent rentals:", error);
        throw new Error("Failed to fetch recent rentals");
    }
}