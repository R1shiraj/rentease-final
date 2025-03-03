// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      phone,
      role,
      // Address fields
      street,
      city,
      state,
      zipCode,
      // Business fields
      businessName,
      businessStreet,
      businessCity,
      businessState,
      businessZipCode,
    } = body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { message: "Required fields are missing" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Prevent regular registration as admin
    if (role === "ADMIN") {
      return NextResponse.json(
        { message: "Cannot register as admin" },
        { status: 403 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create base user data
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "USER",
      address: {
        street: street || "",
        city: city || "",
        state: state || "",
        zipCode: zipCode || "",
      },
    };

    // Add provider-specific data if applicable
    if (role === "PROVIDER") {
      if (
        !businessName ||
        !businessStreet ||
        !businessCity ||
        !businessState ||
        !businessZipCode
      ) {
        return NextResponse.json(
          { message: "All business fields are required for providers" },
          { status: 400 }
        );
      }

      userData.businessName = businessName;
      userData.businessAddress = {
        street: businessStreet,
        city: businessCity,
        state: businessState,
        zipCode: businessZipCode,
      };
      userData.rating = 0;
      userData.appliances = [];
      userData.isVerified = false;
    }

    // Create new user
    const newUser = await User.create(userData);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        message: "An error occurred during registration",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
