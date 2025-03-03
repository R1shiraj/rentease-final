// src/app/provider/layout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProviderLayout from "@/components/layout/ProviderLayout";
import { Toaster } from "@/components/ui/toaster";

export default async function ProviderLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PROVIDER") {
    redirect("/auth/login");
  }

  return (
    <ProviderLayout>
      {children}
      <Toaster />
    </ProviderLayout>
  );
}
