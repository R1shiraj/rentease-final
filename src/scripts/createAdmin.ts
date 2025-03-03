// src/scripts/createAdmin.ts
import { config } from 'dotenv';
import connectToDatabase from "../lib/mongodb.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

// Load environment variables
config();

async function createAdminUser() {
    try {
        const mongoose = await connectToDatabase();

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            throw new Error("Admin credentials not found in environment variables");
        }

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("Admin user already exists");
            process.exit(0);
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const adminUser = await User.create({
            email: adminEmail,
            password: hashedPassword,
            name: "Admin",
            phone: "admin",
            role: "ADMIN",
            address: {
                street: "",
                city: "",
                state: "",
                zipCode: "",
            },
        });

        console.log("Admin user created successfully:", adminUser.email);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    }
}

// Run the function
createAdminUser();