"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Calendar, User, Truck, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

// Define types
interface Appliance {
  _id: string;
  name: string;
  images: string[];
  pricing: {
    daily: number;
    weekly: number;
    monthly: number;
    deposit: number;
  };
  status: string;
}

interface Provider {
  _id: string;
  name: string;
  businessName: string;
  phone: string;
}

interface Rental {
  _id: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED";
  startDate: string;
  endDate: string;
  totalAmount: number;
  deposit: number;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  deliveryTime: string;
  createdAt: string;
  applianceId: Appliance;
  providerId: Provider;
}

// Helper function for status badges - moved outside of component to be reusable
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge className="bg-yellow-500">Pending</Badge>;
    case "ACTIVE":
      return <Badge className="bg-green-500">Active</Badge>;
    case "COMPLETED":
      return <Badge className="bg-blue-500">Completed</Badge>;
    case "CANCELLED":
      return <Badge className="bg-pink-500">Cancelled</Badge>;
    case "APPROVED":
      return <Badge className="bg-emerald-500">Approved</Badge>;
    case "REJECTED":
      return <Badge className="bg-red-500">Rejected</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

// RentalCard component
function RentalCard({ rental }: { rental: Rental }) {
  const router = useRouter();

  // Format dates for display
  const startDate = new Date(rental.startDate).toLocaleDateString();
  const endDate = new Date(rental.endDate).toLocaleDateString();
  // Add this inside the RentalCard component, near where you format the other dates
  const createdAt = new Date(rental.createdAt).toLocaleDateString();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full bg-muted">
        {rental.applianceId.images && rental.applianceId.images.length > 0 ? (
          <Image
            src={rental.applianceId.images[0]}
            alt={rental.applianceId.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          {getStatusBadge(rental.status)}
        </div>
      </div>

      <CardHeader className="p-4">
        <CardTitle className="line-clamp-1">
          {rental.applianceId.name}
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-1 mt-1">
            <Calendar className="h-4 w-4" />
            <span>
              {startDate} - {endDate}
            </span>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        {/* // Then add this to the CardContent section */}
        <div className="text-xs text-muted-foreground mt-2">
          Created: {createdAt}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium flex items-center gap-1">
              ₹{rental.totalAmount}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Payment</span>
            <span className="font-medium capitalize">
              {rental.paymentStatus}
            </span>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/user/rentals/${rental._id}`)}
          className="w-full"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}

// Skeleton loader component
function RentalsSkeleton() {
  return (
    <div className="container mx-auto px-4">
      <div className="h-9 w-48 bg-muted rounded mb-6"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ActiveRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchRentals() {
      try {
        setIsLoading(true);
        // Use commas in the query parameter to fetch multiple statuses
        const response = await fetch(
          "/api/user/rentals?status=PENDING,ACTIVE,APPROVED,REJECTED"
        );

        const data = await response.json();

        if (data.success) {
          setRentals(data.rentals);
        } else {
          setError(data.error || "Failed to load rentals");
        }
      } catch (err) {
        setError("An error occurred while fetching rentals");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRentals();
  }, []);

  const pendingRentals = rentals.filter(
    (rental) => rental.status === "PENDING"
  );
  const activeRentals = rentals.filter((rental) => rental.status === "ACTIVE");
  const approvedRentals = rentals.filter(
    (rental) => rental.status === "APPROVED"
  );
  const rejectedRentals = rentals.filter(
    (rental) => rental.status === "REJECTED"
  );
  if (isLoading) {
    return <RentalsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-2xl font-bold">Error Loading Rentals</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (
    pendingRentals.length === 0 &&
    activeRentals.length === 0 &&
    approvedRentals.length === 0 &&
    rejectedRentals.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-bold">No Rentals</h3>
        <p className="text-muted-foreground mt-2">
          You do not have any rentals at the moment.
        </p>
        <Button
          onClick={() => router.push("/user/appliances")}
          className="mt-6"
        >
          Browse Appliances
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">My Active Rentals</h1>

      <Tabs defaultValue="active" className="w-full">
        <div className="relative rounded-sm overflow-x-scroll md:overflow-auto h-10 bg-muted">
          <TabsList className="absolute flex flex-row justify-stretch w-full">
            <TabsTrigger value="active" className="flex gap-2 w-full">
              <Package className="h-4 w-4" />
              Active
              {activeRentals.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeRentals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex gap-2 w-full">
              <Calendar className="h-4 w-4" />
              Pending
              {pendingRentals.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingRentals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex gap-2 w-full">
              <User className="h-4 w-4" />
              Approved
              {approvedRentals.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {approvedRentals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex gap-2 w-full">
              <AlertCircle className="h-4 w-4" />
              Rejected
              {rejectedRentals.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {rejectedRentals.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="active" className="space-y-6">
          {activeRentals.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No active rentals found</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeRentals.map((rental) => (
                <RentalCard key={rental._id} rental={rental} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          {pendingRentals.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No pending rentals found</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingRentals.map((rental) => (
                <RentalCard key={rental._id} rental={rental} />
              ))}
            </div>
          )}
        </TabsContent>
        {/* Add these new TabsContent sections after the existing ones */}
        <TabsContent value="approved" className="space-y-6">
          {approvedRentals.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No approved rentals found</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {approvedRentals.map((rental) => (
                <RentalCard key={rental._id} rental={rental} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          {rejectedRentals.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No rejected rentals found</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rejectedRentals.map((rental) => (
                <RentalCard key={rental._id} rental={rental} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
