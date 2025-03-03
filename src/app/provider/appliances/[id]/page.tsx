// src/app/provider/appliances/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import Category from "@/models/Category";
import ApplianceForm from "@/components/provider/ApplianceForm";
import { getApplianceById } from "@/app/actions/appliance";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

// Fetch categories for the form
async function getCategories() {
  await connectToDatabase();
  const categories = await Category.find({ isActive: true }).lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function EditAppliancePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PROVIDER") {
    redirect("/auth/login");
  }

  const { success, data: appliance, error } = await getApplianceById(params.id);

  if (!success || !appliance) {
    notFound();
  }

  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/provider/appliances">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Appliance</h1>
      </div>
      <p className="text-muted-foreground">
        Update your appliance details and availability.
      </p>

      <ApplianceForm categories={categories} appliance={appliance} />
    </div>
  );
}
