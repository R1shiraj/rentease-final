// src/app/provider/appliances/new/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import ApplianceForm from "@/components/provider/ApplianceForm";

// Fetch categories for the form
async function getCategories() {
  await connectToDatabase();
  const categories = await Category.find({ isActive: true }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function NewAppliancePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PROVIDER") {
    redirect("/auth/login");
  }

  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Appliance</h1>
        <p className="text-muted-foreground mt-2">
          Create a new appliance listing for customers to rent.
        </p>
      </div>

      <ApplianceForm categories={categories} />
    </div>
  );
}
