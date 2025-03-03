// src/app/provider/appliances/[id]/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function ApplianceNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        404
      </h1>
      <h2 className="text-2xl font-semibold mb-2">Appliance Not Found</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        The appliance you're looking for doesn't exist or you don't have access
        to it.
      </p>
      <Link href="/provider/appliances">
        <Button className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Appliances
        </Button>
      </Link>
    </div>
  );
}
