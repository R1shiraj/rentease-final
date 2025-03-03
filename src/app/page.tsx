// src/app/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Home Appliance Rental</h1>
          <p className="text-gray-600 text-lg">
            Rent high-quality appliances for your home
          </p>
        </header>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Welcome {session?.user?.name}!
          </h2>
          <p className="mb-4">
            You are logged in as:{" "}
            <span className="font-semibold">{session?.user?.email}</span>
          </p>
          <p className="mb-4">
            Account type:{" "}
            <span className="font-semibold">{session?.user?.role}</span>
          </p>

          {/* Add Logout Button Here */}
          <LogoutButton />

          <div className="mt-6">
            {session?.user?.role === "PROVIDER" ? (
              <Link
                href="/provider"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Go to Provider Dashboard
              </Link>
            ) : session?.user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                Go to Admin Dashboard
              </Link>
            ) : (
              <Link
                href="/user"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Go to User Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">Browse Appliances</h3>
            <p className="text-gray-600 mb-4">
              Explore our wide selection of home appliances
            </p>
            <Link href="/appliances" className="text-blue-600 hover:underline">
              View all appliances →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">Categories</h3>
            <p className="text-gray-600 mb-4">Find appliances by category</p>
            <Link href="/categories" className="text-blue-600 hover:underline">
              Browse categories →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">Account</h3>
            <p className="text-gray-600 mb-4">
              Manage your account settings and rentals
            </p>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              Go to dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
