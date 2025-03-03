// src/components/user/CancelRentalButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface CancelRentalButtonProps {
  rentalId: string;
  disabled?: boolean;
}

const CancelRentalButton = ({
  rentalId,
  disabled = false,
}: CancelRentalButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCancel = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/user/rentals/${rentalId}/cancel`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Rental Cancelled",
          description: "Your rental has been cancelled successfully.",
          variant: "default",
        });

        // Refresh the page data
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to cancel rental",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="w-auto"
        onClick={() => setIsDialogOpen(true)}
        disabled={disabled || isLoading}
      >
        <X className="mr-2 h-4 w-4" />
        Cancel Rental
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Rental</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this rental? This action cannot be
              undone.
              {isLoading && " Processing your request..."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              No, Keep It
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancel();
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground"
            >
              Yes, Cancel Rental
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CancelRentalButton;
