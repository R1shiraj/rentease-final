// src/components/user/UserLayout.tsx

"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Menu,
  X,
  Home,
  ShoppingCart,
  Package,
  History,
  Star,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

// Navigation items for the sidebar
const navItems = [
  { name: "Home", href: "/user", icon: Home },
  { name: "Cart", href: "/user/cart", icon: ShoppingCart },
  { name: "Active Rentals", href: "/user/rentals/active", icon: Package },
  { name: "Rental History", href: "/user/rentals/history", icon: History },
  { name: "My Reviews", href: "/user/reviews", icon: Star },
  { name: "Profile", href: "/user/profile", icon: User },
];

const NavItem = ({ name, href, icon: Icon, isActive, onClick }) => (
  <Link
    href={href}
    className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:bg-accent
      ${isActive ? "bg-accent" : "transparent"}`}
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{name}</span>
  </Link>
);

const Sidebar = ({ className = "", onNavItemClick }) => {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className={`h-full border-r bg-card ${className}`}>
      <div className="flex h-full flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-tight">Rentease</h2>
        </div>
        <ScrollArea className="flex-1 px-4">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                isActive={pathname === item.href}
                onClick={onNavItemClick}
              />
            ))}
          </div>
        </ScrollArea>
        <div className="sticky bottom-0 border-t bg-card p-6">
          <Button
            variant="destructive"
            className="w-full justify-start gap-3 py-6 text-base"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

const UserLayout = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNavItemClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden w-72 lg:block" />

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed left-4 top-4 z-40"
            size="icon"
          >
            <Menu className="h-8 w-8" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar onNavItemClick={handleNavItemClick} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 pt-24 lg:pt-8">
        {children}
      </main>
    </div>
  );
};

export default UserLayout;
