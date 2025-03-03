// src/app/(dashboard)/provider/layout.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ProviderSidebar } from "@/components/provider/ProviderSidebar";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== "PROVIDER") {
    // Redirect non-providers to appropriate dashboard
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    } else {
      redirect("/user/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProviderSidebar user={session.user} />
      <main className="flex-1 md:ml-64">
        <div className="container p-4 md:p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
