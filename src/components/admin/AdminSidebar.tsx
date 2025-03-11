// src/components/admin/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Users,
  ShieldCheck,
  ListOrdered,
  BarChart3,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: <BarChart3 className="h-5 w-5" />,
    path: "/admin",
  },
  {
    title: "User Management",
    icon: <Users className="h-5 w-5" />,
    path: "/admin/users",
  },
  {
    title: "Provider Verification",
    icon: <ShieldCheck className="h-5 w-5" />,
    path: "/admin/providers",
  },
  {
    title: "Category Management",
    icon: <ListOrdered className="h-5 w-5" />,
    path: "/admin/categories",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu toggle */}
      <div className="fixed top-4 left-4 z-30 md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 bg-primary text-white rounded-md shadow-lg"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Desktop sidebar */}
      <div
        className={`fixed top-0 left-0 z-20 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-2xl ml-10 sm:ml-4 font-bold text-primary">
              Admin Panel
            </h2>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.path
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            ))}

            {/* <Link
              href="/"
              className="flex items-center px-4 py-3 mt-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5 mr-3" />
              <span>Back to Home</span>
            </Link> */}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
