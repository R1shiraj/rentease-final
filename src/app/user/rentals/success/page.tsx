// src/app/user/rentals/success/page.tsx
"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const RentalSuccessPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Rental Successful!</h1>
      <p className="text-muted-foreground mb-6">
        Your appliance rental has been confirmed. You can view the details in
        your rentals.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => router.push("/user/rentals/active")}>
          View Rentals
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/user/appliances")}
        >
          Rent More
        </Button>
      </div>
    </div>
  );
};

export default RentalSuccessPage;
