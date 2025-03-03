// src/app/user/rentals/history/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  DollarSign,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { formatDate, getDurationInDays } from "@/lib/calci";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface IApplianceDetails {
  _id: string;
  name: string;
  images: string[];
  pricing: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  status: string;
}

interface IProviderDetails {
  _id: string;
  name: string;
  businessName: string;
  phone: string;
}

interface IRental {
  _id: string;
  applianceId: IApplianceDetails;
  providerId: IProviderDetails;
  startDate: string;
  endDate: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  paymentMethod: string;
  createdAt: string;
}

const RentalStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="bg-green-500">
          <Check className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="destructive">
          <X className="mr-1 h-3 w-3" />
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          <Clock className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      );
  }
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "PAID":
      return (
        <Badge
          variant="outline"
          className="bg-green-500/10 text-green-500 border-green-500"
        >
          <Check className="mr-1 h-3 w-3" />
          Paid
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-500 border-blue-500"
        >
          <DollarSign className="mr-1 h-3 w-3" />
          Refunded
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-yellow-500/10 text-yellow-500 border-yellow-500"
        >
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
  }
};

const RentalHistoryItem = ({ rental }: { rental: IRental }) => {
  const {
    applianceId,
    startDate,
    endDate,
    status,
    totalAmount,
    paymentStatus,
  } = rental;
  const formattedStartDate = formatDate(new Date(startDate));
  const formattedEndDate = formatDate(new Date(endDate));
  const durationDays = getDurationInDays(
    new Date(startDate),
    new Date(endDate)
  );

  return (
    <Card className="mb-4">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3 relative h-32 md:h-full">
            <Image
              src={applianceId.images[0] || "/placeholder-appliance.jpg"}
              alt={applianceId.name}
              fill
              className="object-cover rounded-tl-lg rounded-bl-lg"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="md:col-span-9 p-4">
            <div className="flex flex-col md:flex-row justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  {applianceId.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formattedStartDate} - {formattedEndDate} ({durationDays}{" "}
                    days)
                  </span>
                </div>
                <p className="text-sm font-medium">
                  Total: ${totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2 mt-2 md:mt-0">
                <RentalStatusBadge status={status} />
                <PaymentStatusBadge status={paymentStatus} />
                <Link href={`/user/rentals/${rental._id}`}>
                  <Button variant="outline" size="sm" className="mt-1">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RentalHistoryPage = () => {
  const [rentals, setRentals] = useState<IRental[]>([]);
  const [filteredRentals, setFilteredRentals] = useState<IRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "/api/user/rentals?status=COMPLETED,CANCELLED"
        );
        const data = await response.json();

        if (data.success) {
          setRentals(data.rentals);
          setFilteredRentals(data.rentals);
        } else {
          setError(data.error || "Failed to fetch rental history");
        }
      } catch (err) {
        setError("An error occurred while fetching rental history");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  useEffect(() => {
    if (timeFilter === "all") {
      setFilteredRentals(rentals);
      return;
    }

    const now = new Date();
    const filtered = rentals.filter((rental) => {
      const rentalDate = new Date(rental.createdAt);
      const diffInDays = Math.floor(
        (now.getTime() - rentalDate.getTime()) / (1000 * 3600 * 24)
      );

      if (timeFilter === "last30") return diffInDays <= 30;
      if (timeFilter === "last90") return diffInDays <= 90;
      if (timeFilter === "last180") return diffInDays <= 180;

      return true;
    });

    setFilteredRentals(filtered);
  }, [timeFilter, rentals]);

  const renderContent = () => {
    if (loading) {
      return Array(3)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="mb-4">
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ));
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (filteredRentals.length === 0) {
      return (
        <Alert>
          <AlertDescription>
            No rental history found for the selected time period.
          </AlertDescription>
        </Alert>
      );
    }

    return filteredRentals.map((rental) => (
      <RentalHistoryItem key={rental._id} rental={rental} />
    ));
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Rental History</CardTitle>
              <CardDescription>
                Review your past rentals and cancelled orders
              </CardDescription>
            </div>
            <div className="w-full md:w-48">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="last30">Last 30 days</SelectItem>
                  <SelectItem value="last90">Last 90 days</SelectItem>
                  <SelectItem value="last180">Last 180 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value="all">{renderContent()}</TabsContent>

            <TabsContent value="completed">
              {loading ? (
                Array(2)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="mb-4">
                      <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                  ))
              ) : filteredRentals.filter((r) => r.status === "COMPLETED")
                  .length > 0 ? (
                filteredRentals
                  .filter((rental) => rental.status === "COMPLETED")
                  .map((rental) => (
                    <RentalHistoryItem key={rental._id} rental={rental} />
                  ))
              ) : (
                <Alert>
                  <AlertDescription>
                    No completed rentals found.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="cancelled">
              {loading ? (
                Array(2)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="mb-4">
                      <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                  ))
              ) : filteredRentals.filter((r) => r.status === "CANCELLED")
                  .length > 0 ? (
                filteredRentals
                  .filter((rental) => rental.status === "CANCELLED")
                  .map((rental) => (
                    <RentalHistoryItem key={rental._id} rental={rental} />
                  ))
              ) : (
                <Alert>
                  <AlertDescription>
                    No cancelled rentals found.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalHistoryPage;
