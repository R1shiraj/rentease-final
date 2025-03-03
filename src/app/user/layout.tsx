// src/app/user/layout.tsx

import { Toaster } from "@/components/ui/toaster";
import UserLayout from "@/components/user/UserLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserLayout>
      {children}
      <Toaster />
    </UserLayout>
  );
}
