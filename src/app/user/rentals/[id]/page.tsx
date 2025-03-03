// src/app/user/rentals/[id]/page.tsx

"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  IndianRupee,
  Info,
  MapPin,
  Phone,
  Truck,
  X,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import CancelRentalButton from "@/components/user/CancelRentalButton";
import { formatDate, getDurationInDays } from "@/lib/calci";

// Define interfaces
interface ISpecification {
  brand: string;
  model: string;
  year: number;
  [key: string]: any;
}

interface IAppliance {
  _id: string;
  name: string;
  images: string[];
  specifications: ISpecification;
}

interface IDeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface IRental {
  _id: string;
  applianceId: IAppliance;
  providerId: string;
  startDate: string;
  endDate: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED";
  totalAmount: number;
  deposit: number;
  paymentStatus: "PENDING" | "PAID" | "REFUNDED";
  paymentMethod: string;
  deliveryAddress: IDeliveryAddress;
  deliveryTime: string;
  hasReview: boolean;
  createdAt: string;
  updatedAt: string;
}

const RentalDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [rental, setRental] = useState<IRental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchRentalDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/rentals/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setRental(data.rental);
        } else {
          setError(data.error || "Failed to fetch rental details");
        }
      } catch (err) {
        setError("An error occurred while fetching rental details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRentalDetails();
    }
  }, [params.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "ACTIVE":
        return (
          <Badge className="bg-blue-500 text-white">
            <Check className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-500 text-white">
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
            <Info className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500"
          >
            Paid
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-500 border-blue-500"
          >
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500"
          >
            Pending
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!rental) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>
          The rental information could not be found.
        </AlertDescription>
      </Alert>
    );
  }

  const {
    applianceId,
    startDate,
    endDate,
    status,
    totalAmount,
    deposit,
    paymentStatus,
    paymentMethod,
    deliveryAddress,
    deliveryTime,
    hasReview,
  } = rental;

  const formattedStartDate = formatDate(new Date(startDate));
  const formattedEndDate = formatDate(new Date(endDate));
  const durationDays = getDurationInDays(
    new Date(startDate),
    new Date(endDate)
  );
  const canCancel = status === "PENDING" || status === "ACTIVE";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {canCancel && <CancelRentalButton rentalId={rental._id} />}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                Rental #{rental._id.slice(-6)}
              </CardTitle>
              <CardDescription>
                {formatDate(new Date(rental.createdAt))}
              </CardDescription>
            </div>
            {getStatusBadge(status)}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Image and basic info */}
          <div className="px-6 pb-3">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-1/3 aspect-square sm:aspect-video rounded-md overflow-hidden bg-gray-100 border">
                {applianceId.images && applianceId.images.length > 0 ? (
                  <Image
                    src={applianceId.images[0]}
                    alt={applianceId.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No image</p>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <h2 className="font-semibold text-lg">{applianceId.name}</h2>
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    {applianceId.specifications.brand}{" "}
                    {applianceId.specifications.model} (
                    {applianceId.specifications.year})
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs h-8"
                  >
                    <Link href={`/user/appliances/${applianceId._id}`}>
                      View Appliance
                    </Link>
                  </Button>

                  {status === "COMPLETED" && !hasReview && (
                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      className="text-xs h-8"
                    >
                      <Link href={`/user/reviews/add?rentalId=${rental._id}`}>
                        <Star className="mr-1 h-3 w-3" />
                        Review
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tab navigation - simplified for mobile */}
          <div className="flex border-b px-2">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "details"
                  ? "border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "delivery"
                  ? "border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("delivery")}
            >
              Delivery
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "payment"
                  ? "border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("payment")}
            >
              Payment
            </button>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "details" && (
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Rental Period</p>
                    <p className="text-sm">
                      {formattedStartDate} - {formattedEndDate}
                      <span className="ml-2 text-muted-foreground">
                        ({durationDays} {durationDays === 1 ? "day" : "days"})
                      </span>
                    </p>
                  </div>
                </div>

                {status === "PENDING" && (
                  <Alert className="mt-2 bg-yellow-50 text-yellow-800 border-yellow-300">
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Pending Approval</AlertTitle>
                    <AlertDescription>
                      Your rental request is awaiting provider approval.
                    </AlertDescription>
                  </Alert>
                )}

                {status === "ACTIVE" && (
                  <Alert className="mt-2 bg-blue-50 text-blue-800 border-blue-300">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Active Rental</AlertTitle>
                    <AlertDescription>
                      Your rental is currently active.
                    </AlertDescription>
                  </Alert>
                )}

                {status === "COMPLETED" && (
                  <Alert className="mt-2 bg-green-50 text-green-800 border-green-300">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Completed</AlertTitle>
                    <AlertDescription>
                      This rental has been completed successfully.
                    </AlertDescription>
                  </Alert>
                )}

                {status === "CANCELLED" && (
                  <Alert className="mt-2 bg-red-50 text-red-800 border-red-300">
                    <X className="h-4 w-4" />
                    <AlertTitle>Cancelled</AlertTitle>
                    <AlertDescription>
                      This rental was cancelled.
                      {paymentStatus === "REFUNDED" &&
                        " Your payment has been refunded."}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="text-sm">
                      {deliveryAddress.street}, {deliveryAddress.city},{" "}
                      {deliveryAddress.state}, {deliveryAddress.zipCode}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Truck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Delivery Time</p>
                    <p className="text-sm">{deliveryTime}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">₹{totalAmount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium">₹{deposit.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Deposit</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Method:</span>
                    <Badge variant="outline" className="font-normal">
                      {paymentMethod === "CASH_ON_DELIVERY"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Status:</span>
                    {getPaymentStatusBadge(paymentStatus)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {status === "COMPLETED" && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 rounded-full p-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-medium text-green-800">
                  Rental Completed
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href="/user/appliances">Rent Again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RentalDetailPage;
