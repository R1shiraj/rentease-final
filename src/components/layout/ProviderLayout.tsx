// src/components/layout/ProviderLayout.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Import the client component
import ProviderLayoutClient from "./ProviderLayoutClient";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PROVIDER") {
    redirect("/auth/login");
  }

  return (
    <ProviderLayoutClient userName={session.user.name || session.user.email}>
      {children}
    </ProviderLayoutClient>
  );
}
