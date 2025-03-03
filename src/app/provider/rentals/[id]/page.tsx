// src/app/provider/rentals/[id]/page.tsx
import { getProviderRental } from "@/app/actions/rental";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import RentalStatusActions from "./rental-status-actions";

export default async function RentalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { rental, error } = await getProviderRental(params.id);

  if (error || !rental) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left column with appliance image and details */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Rented Appliance</CardTitle>
              <CardDescription>Details of the rented appliance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 w-full mb-4 rounded-lg overflow-hidden">
                <Image
                  src={
                    rental.applianceId.images[0] || "/placeholder-appliance.jpg"
                  }
                  alt={rental.applianceId.name}
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-semibold mb-2">
                {rental.applianceId.name}
              </h3>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="font-medium">
                    {rental.applianceId.specifications.brand}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Model</p>
                  <p className="font-medium">
                    {rental.applianceId.specifications.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year</p>
                  <p className="font-medium">
                    {rental.applianceId.specifications.year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Daily Rate</p>
                  <p className="font-medium">
                    {formatCurrency(rental.applianceId.pricing.daily)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Link href={`/provider/appliances/${rental.applianceId._id}`}>
                  <Button variant="outline" size="sm">
                    View Appliance Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column with rental details */}
        <div className="flex-1">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Rental Details</CardTitle>
                  <CardDescription>Booking information</CardDescription>
                </div>
                <div className="px-4 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {rental.status}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Rental Period
                  </h4>
                  <p className="font-medium">
                    {formatDate(rental.startDate)} -{" "}
                    {formatDate(rental.endDate)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Total Amount
                    </h4>
                    <p className="font-medium">
                      {formatCurrency(rental.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Deposit
                    </h4>
                    <p className="font-medium">
                      {formatCurrency(rental.deposit)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Payment Status
                    </h4>
                    <p className="font-medium">{rental.paymentStatus}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Payment Method
                    </h4>
                    <p className="font-medium">
                      {rental.paymentMethod.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Delivery Time
                  </h4>
                  <p className="font-medium">{rental.deliveryTime}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Delivery Address
                  </h4>
                  <p className="font-medium">
                    {rental.deliveryAddress.street},{" "}
                    {rental.deliveryAddress.city},<br />
                    {rental.deliveryAddress.state},{" "}
                    {rental.deliveryAddress.zipCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Details of the renter</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Customer Name
                  </h4>
                  <p className="font-medium">{rental.userId.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="font-medium">{rental.userId.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                    <p className="font-medium">{rental.userId.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons based on rental status */}
          <div className="mt-6">
            <RentalStatusActions rental={rental} />
          </div>
        </div>
      </div>
    </div>
  );
}
