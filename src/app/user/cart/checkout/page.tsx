"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Truck,
  Shield,
  CreditCard,
  CalendarIcon,
  ArrowLeft,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format, addDays, addMonths, differenceInDays } from "date-fns";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { StripePaymentWrapper } from "@/components/payment/StripePaymentForm";
import { Toaster } from "@/components/ui/toaster";

interface ApplianceData {
  _id: string;
  name: string;
  images: string[];
  pricing: {
    daily: number;
    weekly: number;
    monthly: number;
    deposit: number;
  };
}

const CheckoutPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<
    "ONLINE" | "CASH_ON_DELIVERY"
  >("ONLINE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliances, setAppliances] = useState<ApplianceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // For direct appliance rental
  const applianceId = searchParams.get("applianceId");
  const initialStartDate = searchParams.get("startDate");
  const initialEndDate = searchParams.get("endDate");
  const totalAmount = searchParams.get("totalAmount");
  const depositParam = searchParams.get("deposit");

  // For tracking dates for each appliance (cart checkout)
  const [applianceDates, setApplianceDates] = useState<{
    [key: string]: {
      startDate: Date | null;
      endDate: Date | null;
      totalAmount: number;
    };
  }>(
    applianceId && initialStartDate && initialEndDate
      ? {
          [applianceId]: {
            startDate: new Date(initialStartDate),
            endDate: new Date(initialEndDate),
            totalAmount: Number(totalAmount || 0),
          },
        }
      : {}
  );

  // For address
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [deliveryTime, setDeliveryTime] = useState("10:00-14:00");

  // Validate form state
  const isFormValid = () => {
    const allDatesSelected = Object.entries(applianceDates).every(
      ([_, dates]) => dates.startDate && dates.endDate
    );

    const addressFilled =
      deliveryAddress.street &&
      deliveryAddress.city &&
      deliveryAddress.state &&
      deliveryAddress.zipCode;

    return allDatesSelected && addressFilled && termsAccepted;
  };

  // Calculate days between dates
  const calculateDaysBetween = (start: Date, end: Date) => {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Calculate rental amount based on days
  const calculateRentalAmount = (days: number, pricing: any) => {
    if (days >= 30) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      return months * pricing.monthly + remainingDays * pricing.daily;
    } else if (days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      return weeks * pricing.weekly + remainingDays * pricing.daily;
    } else {
      return days * pricing.daily;
    }
  };

  // Update dates and calculate prices
  const updateDates = (
    appId: string,
    startDate: Date | null,
    endDate: Date | null,
    pricing: any
  ) => {
    if (startDate && endDate) {
      // Ensure end date is at least 30 days after start date
      const minimumEndDate = addMonths(startDate, 1);
      const actualEndDate = endDate < minimumEndDate ? minimumEndDate : endDate;

      const days = calculateDaysBetween(startDate, actualEndDate);
      const amount = calculateRentalAmount(days, pricing);

      setApplianceDates((prev) => ({
        ...prev,
        [appId]: {
          ...prev[appId],
          startDate,
          endDate: actualEndDate,
          totalAmount: amount,
        },
      }));
    }
  };

  // Fetch appliance data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (applianceId) {
          // Direct rental - fetch single appliance
          const res = await fetch(`/api/appliances/${applianceId}`);
          if (res.ok) {
            const data = await res.json();
            setAppliances([data.appliance]);
          }
        } else {
          // Cart checkout - fetch cart items
          const res = await fetch("/api/user/cart");
          if (res.ok) {
            const data = await res.json();

            // Initialize empty date entries for each cart item
            const initialDates: {
              [key: string]: {
                startDate: Date | null;
                endDate: Date | null;
                totalAmount: number;
              };
            } = {};

            data.cartItems.forEach((item: any) => {
              initialDates[item.appliance._id] = {
                startDate: null,
                endDate: null,
                totalAmount: 0,
              };
            });

            setApplianceDates(initialDates);
            setAppliances(data.cartItems.map((item: any) => item.appliance));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load checkout information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [applianceId]);

  // Handle initial payment flow
  const handlePayment = () => {
    // Check if all required information is filled
    if (!isFormValid()) {
      if (!termsAccepted) {
        toast({
          title: "Terms and Conditions",
          description: "Please accept the terms and conditions to proceed",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "CASH_ON_DELIVERY") {
      handleConfirmOrder();
    } else {
      // Show Stripe payment dialog
      setShowPaymentModal(true);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    try {
      await handleConfirmOrder(true);
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error processing order after payment:", error);
    }
  };

  // Fix in the handleConfirmOrder function

  const handleConfirmOrder = async (paymentCompleted = false) => {
    try {
      setIsSubmitting(true);

      // Check if all appliances have dates selected (for cart checkout)
      const allDatesSelected = Object.entries(applianceDates).every(
        ([_, dates]) => dates.startDate && dates.endDate
      );

      if (!allDatesSelected) {
        toast({
          title: "Missing information",
          description: "Please select rental dates for all items",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check minimum rental duration
      const hasInvalidDuration = Object.entries(applianceDates).some(
        ([_, dates]) => {
          if (!dates.startDate || !dates.endDate) return true;
          const days = differenceInDays(dates.endDate, dates.startDate);
          return days < 30;
        }
      );

      if (hasInvalidDuration) {
        toast({
          title: "Invalid rental duration",
          description: "Minimum rental period is 1 month",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create rentals for each appliance
      const rentalPromises = Object.entries(applianceDates).map(
        async ([appId, dates]) => {
          const appliance = appliances.find((a) => a._id === appId);

          if (!appliance || !dates.startDate || !dates.endDate) return null;

          const rentalData = {
            applianceId: appId,
            providerId: "", // This will be set on the server based on the appliance
            startDate: dates.startDate.toISOString(),
            endDate: dates.endDate.toISOString(),
            totalAmount: dates.totalAmount,
            deposit: appliance.pricing.deposit,
            paymentMethod: paymentMethod,
            paymentStatus:
              paymentMethod === "ONLINE" && paymentCompleted
                ? "PAID"
                : "PENDING",
            deliveryAddress,
            deliveryTime,
          };

          const res = await fetch("/api/user/rentals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(rentalData),
          });

          if (!res.ok) {
            throw new Error("Failed to create rental");
          }

          return res.json();
        }
      );

      // Wait for all rental creation promises to resolve
      const results = await Promise.all(rentalPromises);

      // Check if any rentals failed to be created
      if (results.some((result) => result === null)) {
        throw new Error("Failed to create one or more rentals");
      }

      // Clear cart if coming from cart page
      if (!applianceId) {
        await fetch("/api/user/cart/clear", {
          method: "DELETE",
        });
      }

      // Redirect to success page only after all operations are complete
      router.push("/user/rentals/success");
    } catch (error) {
      console.error("Error confirming order:", error);
      toast({
        title: "Error",
        description: "Failed to confirm order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const calculateTotalDeposit = () => {
    return appliances.reduce((sum, app) => sum + app.pricing.deposit, 0);
  };

  const calculateTotalRental = () => {
    return Object.values(applianceDates).reduce(
      (sum, dates) => sum + dates.totalAmount,
      0
    );
  };

  const totalOrderAmount = calculateTotalRental() + calculateTotalDeposit();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6 space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-2 space-y-6">
          {/* Appliances */}
          {appliances.map((appliance) => (
            <Card
              key={appliance._id}
              className="overflow-hidden border-0 shadow-md"
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Appliance Image */}
                  <div className="relative aspect-video sm:aspect-square sm:w-1/3 overflow-hidden">
                    <Image
                      src={appliance.images[0] || "/placeholder-appliance.jpg"}
                      alt={appliance.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Appliance Details */}
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">
                          {appliance.name}
                        </h3>

                        {/* Pricing breakdown */}
                        <div className="mt-2 flex flex-wrap gap-2 text-sm">
                          <Badge variant="outline">
                            ₹{appliance.pricing.daily}/day
                          </Badge>
                          <Badge variant="outline">
                            ₹{appliance.pricing.weekly}/week
                          </Badge>
                          <Badge variant="outline">
                            ₹{appliance.pricing.monthly}/month
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Date Selector */}
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="w-full sm:w-auto">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {applianceDates[appliance._id]?.startDate
                                  ? format(
                                      applianceDates[appliance._id]
                                        .startDate as Date,
                                      "PPP"
                                    )
                                  : "Select start date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={
                                  applianceDates[appliance._id]?.startDate ||
                                  undefined
                                }
                                onSelect={(date) => {
                                  if (date) {
                                    // Default end date is 1 month from start date
                                    const endDate =
                                      applianceDates[appliance._id]?.endDate ||
                                      addMonths(date, 1);
                                    updateDates(
                                      appliance._id,
                                      date,
                                      endDate,
                                      appliance.pricing
                                    );
                                  }
                                }}
                                initialFocus
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="text-center">to</div>

                        <div className="w-full sm:w-auto">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {applianceDates[appliance._id]?.endDate
                                  ? format(
                                      applianceDates[appliance._id]
                                        .endDate as Date,
                                      "PPP"
                                    )
                                  : "Select end date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={
                                  applianceDates[appliance._id]?.endDate ||
                                  undefined
                                }
                                onSelect={(date) => {
                                  if (date) {
                                    const startDate =
                                      applianceDates[appliance._id]
                                        ?.startDate || new Date();

                                    // Ensure minimum 1 month rental
                                    const minEndDate = addMonths(startDate, 1);
                                    if (date < minEndDate) {
                                      toast({
                                        title: "Minimum rental period",
                                        description:
                                          "Rental period must be at least 1 month",
                                        variant: "destructive",
                                      });
                                      updateDates(
                                        appliance._id,
                                        startDate,
                                        minEndDate,
                                        appliance.pricing
                                      );
                                    } else {
                                      updateDates(
                                        appliance._id,
                                        startDate,
                                        date,
                                        appliance.pricing
                                      );
                                    }
                                  }
                                }}
                                initialFocus
                                disabled={(date) => {
                                  const startDate =
                                    applianceDates[appliance._id]?.startDate ||
                                    new Date();
                                  const minEndDate = addMonths(startDate, 1);
                                  return date < minEndDate;
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Show calculated amount */}
                      {applianceDates[appliance._id]?.startDate &&
                        applianceDates[appliance._id]?.endDate && (
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span>Rental period:</span>
                              <span>
                                {calculateDaysBetween(
                                  applianceDates[appliance._id]
                                    .startDate as Date,
                                  applianceDates[appliance._id].endDate as Date
                                )}{" "}
                                days
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span>Rental total:</span>
                              <span className="font-medium">
                                ₹{applianceDates[appliance._id].totalAmount}
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Delivery Address */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h2 className="font-medium mb-4">Delivery Information</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Street Address"
                    className="rounded-md border border-input p-2 w-full"
                    value={deliveryAddress.street}
                    onChange={(e) =>
                      setDeliveryAddress({
                        ...deliveryAddress,
                        street: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    className="rounded-md border border-input p-2 w-full"
                    value={deliveryAddress.city}
                    onChange={(e) =>
                      setDeliveryAddress({
                        ...deliveryAddress,
                        city: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    className="rounded-md border border-input p-2 w-full"
                    value={deliveryAddress.state}
                    onChange={(e) =>
                      setDeliveryAddress({
                        ...deliveryAddress,
                        state: e.target.value,
                      })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Zip Code"
                    className="rounded-md border border-input p-2 w-full"
                    value={deliveryAddress.zipCode}
                    onChange={(e) =>
                      setDeliveryAddress({
                        ...deliveryAddress,
                        zipCode: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Preferred Delivery Time
                  </label>
                  <select
                    className="rounded-md border border-input p-2 w-full"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                  >
                    <option value="10:00-14:00">Morning (10:00 - 14:00)</option>
                    <option value="14:00-18:00">
                      Afternoon (14:00 - 18:00)
                    </option>
                    <option value="18:00-22:00">Evening (18:00 - 22:00)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h2 className="font-medium mb-4">Payment Method</h2>

              <div className="space-y-3">
                <Button
                  variant={paymentMethod === "ONLINE" ? "default" : "outline"}
                  className="w-full justify-start gap-3"
                  onClick={() => setPaymentMethod("ONLINE")}
                >
                  <CreditCard className="h-5 w-5" />
                  Online Payment
                </Button>
                <Button
                  variant={
                    paymentMethod === "CASH_ON_DELIVERY" ? "default" : "outline"
                  }
                  className="w-full justify-start gap-3"
                  onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                >
                  <Truck className="h-5 w-5" />
                  Cash on Delivery
                </Button>

                {paymentMethod === "ONLINE" && (
                  <Alert className="bg-primary/5 border-primary/20 mt-3">
                    <AlertDescription>
                      You can use Stripe test card: 4242 4242 4242 4242 with any
                      future date and CVC.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Terms and Conditions */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => {
                    setTermsAccepted(checked === true);
                  }}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I accept the Terms and Conditions
                  </label>
                  <p className="text-sm text-muted-foreground">
                    By checking this box, you agree to our{" "}
                    <button
                      className="text-primary underline underline-offset-2 hover:text-primary/80 transition"
                      onClick={() => setShowTermsModal(true)}
                      type="button"
                    >
                      Terms and Conditions
                    </button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Total */}
        <div>
          <div className="sticky top-8 space-y-6">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                <h2 className="font-medium mb-4">Order Total</h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Rental Total</span>
                    <span>₹{calculateTotalRental()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Deposit</span>
                    <span>₹{calculateTotalDeposit()}</span>
                  </div>

                  {/* Missing dates warning */}
                  {Object.values(applianceDates).some(
                    (dates) => !dates.startDate || !dates.endDate
                  ) && (
                    <div className="bg-amber-50 text-amber-800 border border-amber-200 p-3 rounded-md text-sm mt-2">
                      Please select rental dates for all items
                    </div>
                  )}

                  {/* Minimum duration warning */}
                  {Object.entries(applianceDates).some(([_, dates]) => {
                    if (!dates.startDate || !dates.endDate) return false;
                    const days = differenceInDays(
                      dates.endDate,
                      dates.startDate
                    );
                    return days < 30;
                  }) && (
                    <div className="bg-amber-50 text-amber-800 border border-amber-200 p-3 rounded-md text-sm mt-2">
                      Minimum rental period is 1 month
                    </div>
                  )}

                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span className="text-xl">
                      ₹
                      {(
                        calculateTotalRental() + calculateTotalDeposit()
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  className="w-full h-12 text-lg font-medium"
                  onClick={handlePayment}
                  disabled={
                    isSubmitting ||
                    Object.values(applianceDates).some(
                      (dates) => !dates.startDate || !dates.endDate
                    ) ||
                    !termsAccepted ||
                    Object.entries(applianceDates).some(([_, dates]) => {
                      if (!dates.startDate || !dates.endDate) return true;
                      const days = differenceInDays(
                        dates.endDate,
                        dates.startDate
                      );
                      return days < 30;
                    })
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Benefits */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <div className="flex gap-2">
                <CheckCircle className="h-5 w-5 text-primary/70" />
                <span className="text-sm">Secure payment</span>
              </div>
              <div className="flex gap-2">
                <Truck className="h-5 w-5 text-primary/70" />
                <span className="text-sm">Free delivery and pickup</span>
              </div>
              <div className="flex gap-2">
                <Shield className="h-5 w-5 text-primary/70" />
                <span className="text-sm">Damage protection included</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Complete Payment</DialogTitle>
          <StripePaymentWrapper
            amount={totalOrderAmount}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentModal(false)}
            metadata={{
              userId: "currentUserId", // Replace with actual user ID
              applianceIds: JSON.stringify(appliances.map((app) => app._id)),
              deliveryAddress: JSON.stringify(deliveryAddress),
              deliveryTime,
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Terms and Conditions
            </DialogTitle>
            <DialogDescription>
              Please read our terms and conditions carefully before proceeding
              with your rental.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">1. Rental Agreement</h3>
              <p className="text-muted-foreground">
                This agreement is between the customer ("you") and HomeAppliance
                Rental Services ("we," "us," "our"). By renting an appliance,
                you agree to the following terms and conditions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">2. Rental Period</h3>
              <p className="text-muted-foreground">
                The minimum rental period is 1 month (30 days). Early
                termination fees may apply if you return the appliance before
                the agreed rental period ends.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">3. Security Deposit</h3>
              <p className="text-muted-foreground">
                A security deposit is required for each appliance. The deposit
                will be refunded within 7 business days after the appliance is
                returned in good condition, subject to inspection.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">4. Payments</h3>
              <p className="text-muted-foreground">
                Payment can be made online or by cash on delivery. For online
                payments, we accept all major credit cards. For rentals longer
                than one month, payments will be automatically charged monthly
                in advance.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">5. Delivery and Pickup</h3>
              <p className="text-muted-foreground">
                We will deliver and pick up the appliance at the address
                provided. You must be present during the scheduled delivery and
                pickup times. Rescheduling fees may apply for missed
                appointments.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">6. Use and Care</h3>
              <p className="text-muted-foreground">
                You are responsible for using the appliance according to
                manufacturer guidelines. Misuse, abuse, or negligence resulting
                in damage will result in repair or replacement costs deducted
                from your security deposit.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">7. Maintenance and Repairs</h3>
              <p className="text-muted-foreground">
                We will handle routine maintenance and repairs due to normal
                wear and tear at no cost to you. You must report any issues
                immediately. Unauthorized repairs will void any warranty
                coverage.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">8. Cancellation</h3>
              <p className="text-muted-foreground">
                Cancellations made 48 hours before the scheduled delivery date
                will receive a full refund. Cancellations made within 48 hours
                of delivery are subject to a 25% cancellation fee.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">9. Liability</h3>
              <p className="text-muted-foreground">
                We are not responsible for any injuries, damages, or losses
                resulting from the use of our appliances. You assume all risks
                associated with the appliance's operation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">10. Privacy</h3>
              <p className="text-muted-foreground">
                We collect and process your personal information in accordance
                with our Privacy Policy. By accepting these terms, you consent
                to our data practices as described in the Privacy Policy.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowTermsModal(false)}
              className="sm:order-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setTermsAccepted(true);
                setShowTermsModal(false);
              }}
              className="sm:order-2"
            >
              Accept Terms
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
};

export default CheckoutPage;
