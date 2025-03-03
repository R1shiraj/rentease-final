"use client";

// src/components/layout/ProviderLayoutClient.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserCircle,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "next-auth/react";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavLink({ href, icon, label, isActive, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-md transition-colors text-base ${
        isActive ? "bg-primary/10 text-primary mx-2" : "hover:bg-muted mx-2"
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default function ProviderLayoutClient({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-2 w-72">
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-semibold text-lg p-4"
                >
                  Appliance Rental Provider
                </Link>
              </div>
              <div className="flex flex-col justify-between h-[calc(100%-60px)] overflow-hidden">
                <nav className="flex flex-col gap-3 mt-2 overflow-y-auto">
                  <NavLink
                    href="/provider"
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    isActive={pathname === "/provider"}
                    onClick={handleLinkClick}
                  />
                  <NavLink
                    href="/provider/appliances"
                    icon={<Package size={20} />}
                    label="Appliances"
                    isActive={pathname.startsWith("/provider/appliances")}
                    onClick={handleLinkClick}
                  />
                  <NavLink
                    href="/provider/rentals"
                    icon={<ShoppingCart size={20} />}
                    label="Rentals"
                    isActive={pathname.startsWith("/provider/rentals")}
                    onClick={handleLinkClick}
                  />
                  <NavLink
                    href="/provider/profile"
                    icon={<UserCircle size={20} />}
                    label="Profile"
                    isActive={pathname.startsWith("/provider/profile")}
                    onClick={handleLinkClick}
                  />
                </nav>
                <div className="flex-shrink-0 pt-6 pb-2 mx-2">
                  <Button
                    variant="destructive"
                    className="w-full justify-start gap-4 py-3 text-base"
                    onClick={() => signOut()}
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Appliance Rental
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline-block">
            Welcome, {userName}
          </span>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:block w-64 shrink-0 border-r h-[calc(100vh-64px)] sticky top-16">
          <div className="flex flex-col h-full">
            <nav className="flex flex-col gap-3 mt-4 p-4 overflow-y-auto flex-grow">
              <NavLink
                href="/provider"
                icon={<LayoutDashboard size={20} />}
                label="Dashboard"
                isActive={pathname === "/provider"}
              />
              <NavLink
                href="/provider/appliances"
                icon={<Package size={20} />}
                label="Appliances"
                isActive={pathname.startsWith("/provider/appliances")}
              />
              <NavLink
                href="/provider/rentals"
                icon={<ShoppingCart size={20} />}
                label="Rentals"
                isActive={pathname.startsWith("/provider/rentals")}
              />
              <NavLink
                href="/provider/profile"
                icon={<UserCircle size={20} />}
                label="Profile"
                isActive={pathname.startsWith("/provider/profile")}
              />
            </nav>
            <div className="p-4 border-t mt-auto">
              <Button
                variant="destructive"
                className="w-full justify-start gap-4 py-3 text-base"
                onClick={() => signOut()}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
