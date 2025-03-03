// src/app/provider/rentals/page.tsx
import { Suspense } from "react";
import { getProviderRentals } from "@/app/actions/rental";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { formatDate, formatCurrency } from "@/lib/utils";

function RentalStatusBadge({ status }: { status: string }) {
  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    ACTIVE: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-purple-100 text-purple-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge className={`${statusColors[status as keyof typeof statusColors]}`}>
      {status}
    </Badge>
  );
}

async function RentalsContent({ status }: { status?: string }) {
  const { rentals, error } = await getProviderRentals(status);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!rentals || rentals.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium">No rentals found</h3>
        <p className="text-gray-500 mt-2">
          {status
            ? `You don't have any ${status.toLowerCase()} rentals yet.`
            : "You don't have any rentals yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rentals.map((rental: any) => (
        <Card key={rental._id} className="overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={rental.applianceId.images[0] || "/placeholder-appliance.jpg"}
              alt={rental.applianceId.name}
              fill
              className="object-cover"
            />
          </div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg truncate">
                {rental.applianceId.name}
              </CardTitle>
              <RentalStatusBadge status={rental.status} />
            </div>
            <CardDescription>
              By {rental.userId.name} • {formatDate(rental.startDate)} -{" "}
              {formatDate(rental.endDate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-col space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-medium">
                  {formatCurrency(rental.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment:</span>
                <span className="font-medium">{rental.paymentStatus}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href={`/provider/rentals/${rental._id}`} className="w-full">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function RentalsPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Rentals</h1>
      </div>
      {/* grid grid-cols-6 mb-4 */}
      <Tabs defaultValue="PENDING" className="w-full">
        <div className="relative rounded-sm overflow-x-scroll md:overflow-auto h-10 bg-muted">
          <TabsList className="absolute flex flex-row justify-stretch w-full">
            <TabsTrigger className="w-full" value="PENDING">
              Pending
            </TabsTrigger>
            <TabsTrigger className="w-full" value="APPROVED">
              Approved
            </TabsTrigger>
            <TabsTrigger className="w-full" value="ACTIVE">
              Active
            </TabsTrigger>
            <TabsTrigger className="w-full" value="COMPLETED">
              Completed
            </TabsTrigger>
            <TabsTrigger className="w-full" value="REJECTED">
              Rejected
            </TabsTrigger>
            <TabsTrigger className="w-full" value="ALL">
              All
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="PENDING">
          <Suspense fallback={<div>Loading pending rentals...</div>}>
            <RentalsContent status="PENDING" />
          </Suspense>
        </TabsContent>

        <TabsContent value="APPROVED">
          <Suspense fallback={<div>Loading approved rentals...</div>}>
            <RentalsContent status="APPROVED" />
          </Suspense>
        </TabsContent>

        <TabsContent value="ACTIVE">
          <Suspense fallback={<div>Loading active rentals...</div>}>
            <RentalsContent status="ACTIVE" />
          </Suspense>
        </TabsContent>

        <TabsContent value="COMPLETED">
          <Suspense fallback={<div>Loading completed rentals...</div>}>
            <RentalsContent status="COMPLETED" />
          </Suspense>
        </TabsContent>

        <TabsContent value="REJECTED">
          <Suspense fallback={<div>Loading rejected rentals...</div>}>
            <RentalsContent status="REJECTED" />
          </Suspense>
        </TabsContent>

        <TabsContent value="ALL">
          <Suspense fallback={<div>Loading all rentals...</div>}>
            <RentalsContent />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
