// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ShieldCheck,
  Package,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import RecentUsersList from "@/components/admin/RecentUsersList";
import RecentRentalsList from "@/components/admin/RecentRentalsList";
import CategoryDistributionChart from "@/components/admin/CategoryDistributionChart";

type AnalyticsData = {
  counts: {
    users: {
      total: number;
      providers: {
        total: number;
        verified: number;
      };
    };
    appliances: {
      total: number;
      available: number;
    };
    categories: {
      total: number;
      active: number;
    };
    rentals: {
      total: number;
      active: number;
      completed: number;
      cancelled: number;
    };
  };
  recentUsers: any[];
  recentRentals: any[];
  popularCategories: {
    categoryId: string;
    categoryName: string;
    applianceCount: number;
  }[];
};

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/admin/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl text-gray-600">
          Unable to load dashboard data. Please refresh the page.
        </h2>
      </div>
    );
  }

  const { counts, recentUsers, recentRentals, popularCategories } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Users"
          value={counts.users.total}
          icon={<Users className="h-8 w-8" />}
          description={`${counts.users.providers.total} providers (${counts.users.providers.verified} verified)`}
          color="blue"
        />
        <StatCard
          title="Appliances"
          value={counts.appliances.total}
          icon={<Package className="h-8 w-8" />}
          description={`${counts.appliances.available} currently available`}
          color="green"
        />
        <StatCard
          title="Categories"
          value={counts.categories.total}
          icon={<ShieldCheck className="h-8 w-8" />}
          description={`${counts.categories.active} active categories`}
          color="purple"
        />
        <StatCard
          title="Rentals"
          value={counts.rentals.total}
          icon={<ShoppingCart className="h-8 w-8" />}
          description={`${counts.rentals.active} active, ${counts.rentals.completed} completed`}
          color="orange"
        />
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <RecentUsersList users={recentUsers} />
          </CardContent>
        </Card>

        {/* Recent Rentals */}
        {/* // src/app/admin/page.tsx (continued) */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recent Rentals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <RecentRentalsList rentals={recentRentals} />
          </CardContent>
        </Card>
      </div>

      {/* Categories Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Categories Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryDistributionChart categories={popularCategories} />
        </CardContent>
      </Card>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  color: "blue" | "green" | "purple" | "orange";
}

const StatCard = ({
  title,
  value,
  icon,
  description,
  color,
}: StatCardProps) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };

  const bgColor = colorClasses[color];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};
