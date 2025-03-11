// src/app/provider/page.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getProviderDashboardStats,
  getRecentRentals,
} from "@/app/actions/provider";
import {
  Package,
  BadgeIndianRupee,
  ShoppingCart,
  Star,
  Clock,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

export default async function ProviderDashboardPage() {
  const stats = await getProviderDashboardStats();
  const recentRentals = await getRecentRentals(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Provider's Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your business and performance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appliances
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppliances}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Rentals
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRentals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingRentalRequests}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Rentals
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedRentals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalEarnings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating.toFixed(1)} / 5.0
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Rentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentRentals.length === 0 ? (
                <p className="text-muted-foreground">No recent rentals found</p>
              ) : (
                <div className="space-y-4">
                  {recentRentals.map((rental) => (
                    <div key={rental._id} className="flex items-center">
                      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        {rental.applianceId.images?.length > 0 ? (
                          // <img
                          //   src={rental.applianceId.images[0]}
                          //   alt={rental.applianceId.name}
                          //   className="w-full h-full object-cover"
                          // />
                          <div className="relative h-full w-full">
                            <Image
                              src={rental.applianceId.images[0]}
                              alt={rental.applianceId.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center text-secondary-foreground">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {rental.applianceId.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {rental.userId.name || rental.userId.email}
                        </p>
                      </div>
                      <div className="flex items-center ml-2">
                        <p
                          className={`text-xs rounded-full px-2 py-1 
                                 ${
                                   rental.status === "ACTIVE"
                                     ? "bg-green-100 text-green-800"
                                     : rental.status === "PENDING"
                                     ? "bg-yellow-100 text-yellow-800"
                                     : rental.status === "COMPLETED"
                                     ? "bg-blue-100 text-blue-800"
                                     : "bg-gray-100 text-gray-800"
                                 }
                                `}
                        >
                          {rental.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" asChild size="sm">
                  <Link href="/provider/rentals">View All Rentals</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button asChild className="w-full justify-start">
                <Link href="/provider/appliances/new">
                  <Package className="mr-2 h-4 w-4" /> Add New Appliance
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/provider/rentals">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Manage Rentals
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/provider/profile">
                  <Star className="mr-2 h-4 w-4" /> Update Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
