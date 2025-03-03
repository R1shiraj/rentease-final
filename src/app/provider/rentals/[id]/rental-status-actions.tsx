// src/app/provider/rentals/[id]/rental-status-actions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateRentalStatus } from "@/app/actions/rental";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface RentalStatusActionsProps {
  rental: any;
}

export default function RentalStatusActions({
  rental,
}: RentalStatusActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

  const handleAction = async (status: string) => {
    setIsLoading(true);
    try {
      const result = await updateRentalStatus(rental._id, status);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: result.message,
        });
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (type: string) => {
    setActionType(type);
    setOpen(true);
  };

  const renderActionButtons = () => {
    switch (rental.status) {
      case "PENDING":
        return (
          <div className="flex flex-col space-y-3">
            <Button
              onClick={() => openDialog("APPROVE")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Approve Rental
            </Button>
            <Button
              onClick={() => openDialog("REJECT")}
              variant="destructive"
              className="w-full"
            >
              Reject Rental
            </Button>
          </div>
        );

      case "APPROVED":
        return (
          <div className="flex flex-col space-y-3">
            <Button onClick={() => openDialog("ACTIVE")} className="w-full">
              Mark as Active (Delivered)
            </Button>
            <Button
              onClick={() => openDialog("CANCEL")}
              variant="destructive"
              className="w-full"
            >
              Cancel Rental
            </Button>
          </div>
        );

      case "ACTIVE":
        return (
          <Button
            onClick={() => openDialog("COMPLETE")}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Mark as Completed
          </Button>
        );

      default:
        return (
          <Button variant="outline" className="w-full" disabled>
            No Actions Available
          </Button>
        );
    }
  };

  const getDialogContent = () => {
    switch (actionType) {
      case "APPROVE":
        return {
          title: "Approve Rental Request",
          description:
            "Are you sure you want to approve this rental request? This will mark the appliance as rented and notify the customer.",
          confirmText: "Approve Rental",
          status: "APPROVED",
          confirmClass: "bg-green-600 hover:bg-green-700",
        };

      case "REJECT":
        return {
          title: "Reject Rental Request",
          description:
            "Are you sure you want to reject this rental request? This action cannot be undone.",
          confirmText: "Reject Rental",
          status: "REJECTED",
          confirmClass: "bg-red-600 hover:bg-red-700",
        };

      case "ACTIVE":
        return {
          title: "Mark Rental as Active",
          description:
            "This confirms that the appliance has been delivered to the customer. Do you want to proceed?",
          confirmText: "Mark as Active",
          status: "ACTIVE",
          confirmClass: "",
        };

      case "COMPLETE":
        return {
          title: "Complete Rental",
          description:
            "This confirms that the rental period is over and the appliance has been returned. The appliance will be marked as available again.",
          confirmText: "Complete Rental",
          status: "COMPLETED",
          confirmClass: "bg-purple-600 hover:bg-purple-700",
        };

      case "CANCEL":
        return {
          title: "Cancel Rental",
          description:
            "Are you sure you want to cancel this approved rental? This will mark the appliance as available again.",
          confirmText: "Cancel Rental",
          status: "CANCELLED",
          confirmClass: "bg-red-600 hover:bg-red-700",
        };

      default:
        return {
          title: "",
          description: "",
          confirmText: "",
          status: "",
          confirmClass: "",
        };
    }
  };

  const dialogContent = getDialogContent();

  return (
    <>
      {renderActionButtons()}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className={dialogContent.confirmClass}
              onClick={() => handleAction(dialogContent.status)}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : dialogContent.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
