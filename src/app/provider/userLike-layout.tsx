// src/app/provider/layout.tsx

// It uses ProviderLayout component
// Reference Claude chat (rishiajdev25@gmail.com): https://claude.ai/chat/43f2b777-57b5-48d5-8a08-9e20bb95e0c8
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProviderLayout from "@/components/provider/ProviderLayout";

export default async function RootProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "PROVIDER") {
    redirect("/auth/login");
  }

  const userName = session.user.name || undefined;
  const userEmail = session.user.email || undefined;

  return (
    <ProviderLayout userName={userName} userEmail={userEmail}>
      {children}
    </ProviderLayout>
  );
}
