// src/components/admin/RecentRentalsList.tsx
import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";

interface Rental {
  _id: string;
  userId: string;
  applianceId: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
}

interface RecentRentalsListProps {
  rentals: Rental[];
}

export default function RecentRentalsList({ rentals }: RecentRentalsListProps) {
  if (!rentals || rentals.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No recent rentals found
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="divide-y">
      {rentals.map((rental) => (
        <div
          key={rental._id}
          className="flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="mb-2 md:mb-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm md:text-base">
                Rental #{rental._id.substring(rental._id.length - 6)}
              </h3>
              <Badge
                variant="outline"
                className={`ml-2 ${getStatusBadgeColor(rental.status)} text-xs`}
              >
                {rental.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              User ID: {rental.userId.substring(0, 8)}...
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center text-sm">
            <div className="flex items-center space-x-1 mr-4">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">
                ₹{rental.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="text-xs text-gray-500 whitespace-nowrap mt-1 md:mt-0">
              {format(new Date(rental.startDate), "MMM d")} -{" "}
              {format(new Date(rental.endDate), "MMM d, yyyy")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
